package app

import (
	"errors"
	"time"

	"github.com/skorpland/sgptcoder-sdk-go"
	"github.com/skorpland/sgptcoder/internal/attachment"
	"github.com/skorpland/sgptcoder/internal/id"
)

type Prompt struct {
	Text        string                   `toml:"text"`
	Attachments []*attachment.Attachment `toml:"attachments"`
}

func (p Prompt) ToMessage(
	messageID string,
	sessionID string,
) Message {
	message := sgptcoder.UserMessage{
		ID:        messageID,
		SessionID: sessionID,
		Role:      sgptcoder.UserMessageRoleUser,
		Time: sgptcoder.UserMessageTime{
			Created: float64(time.Now().UnixMilli()),
		},
	}

	text := p.Text
	textAttachments := []*attachment.Attachment{}
	for _, attachment := range p.Attachments {
		if attachment.Type == "text" {
			textAttachments = append(textAttachments, attachment)
		}
	}
	for i := 0; i < len(textAttachments)-1; i++ {
		for j := i + 1; j < len(textAttachments); j++ {
			if textAttachments[i].StartIndex < textAttachments[j].StartIndex {
				textAttachments[i], textAttachments[j] = textAttachments[j], textAttachments[i]
			}
		}
	}
	for _, att := range textAttachments {
		if source, ok := att.GetTextSource(); ok {
			if att.StartIndex > att.EndIndex || att.EndIndex > len(text) {
				continue
			}
			text = text[:att.StartIndex] + source.Value + text[att.EndIndex:]
		}
	}

	parts := []sgptcoder.PartUnion{sgptcoder.TextPart{
		ID:        id.Ascending(id.Part),
		MessageID: messageID,
		SessionID: sessionID,
		Type:      sgptcoder.TextPartTypeText,
		Text:      text,
	}}
	for _, attachment := range p.Attachments {
		if attachment.Type == "agent" {
			source, _ := attachment.GetAgentSource()
			parts = append(parts, sgptcoder.AgentPart{
				ID:        id.Ascending(id.Part),
				MessageID: messageID,
				SessionID: sessionID,
				Name:      source.Name,
				Source: sgptcoder.AgentPartSource{
					Value: attachment.Display,
					Start: int64(attachment.StartIndex),
					End:   int64(attachment.EndIndex),
				},
			})
			continue
		}

		text := sgptcoder.FilePartSourceText{
			Start: int64(attachment.StartIndex),
			End:   int64(attachment.EndIndex),
			Value: attachment.Display,
		}
		source := &sgptcoder.FilePartSource{}
		switch attachment.Type {
		case "text":
			continue
		case "file":
			if fileSource, ok := attachment.GetFileSource(); ok {
				source = &sgptcoder.FilePartSource{
					Text: text,
					Path: fileSource.Path,
					Type: sgptcoder.FilePartSourceTypeFile,
				}
			}
		case "symbol":
			if symbolSource, ok := attachment.GetSymbolSource(); ok {
				source = &sgptcoder.FilePartSource{
					Text: text,
					Path: symbolSource.Path,
					Type: sgptcoder.FilePartSourceTypeSymbol,
					Kind: int64(symbolSource.Kind),
					Name: symbolSource.Name,
					Range: sgptcoder.SymbolSourceRange{
						Start: sgptcoder.SymbolSourceRangeStart{
							Line:      float64(symbolSource.Range.Start.Line),
							Character: float64(symbolSource.Range.Start.Char),
						},
						End: sgptcoder.SymbolSourceRangeEnd{
							Line:      float64(symbolSource.Range.End.Line),
							Character: float64(symbolSource.Range.End.Char),
						},
					},
				}
			}
		}
		parts = append(parts, sgptcoder.FilePart{
			ID:        id.Ascending(id.Part),
			MessageID: messageID,
			SessionID: sessionID,
			Type:      sgptcoder.FilePartTypeFile,
			Filename:  attachment.Filename,
			Mime:      attachment.MediaType,
			URL:       attachment.URL,
			Source:    *source,
		})
	}
	return Message{
		Info:  message,
		Parts: parts,
	}
}

func (m Message) ToPrompt() (*Prompt, error) {
	switch m.Info.(type) {
	case sgptcoder.UserMessage:
		text := ""
		attachments := []*attachment.Attachment{}
		for _, part := range m.Parts {
			switch p := part.(type) {
			case sgptcoder.TextPart:
				if p.Synthetic {
					continue
				}
				text += p.Text + " "
			case sgptcoder.AgentPart:
				attachments = append(attachments, &attachment.Attachment{
					ID:         p.ID,
					Type:       "agent",
					Display:    p.Source.Value,
					StartIndex: int(p.Source.Start),
					EndIndex:   int(p.Source.End),
					Source: &attachment.AgentSource{
						Name: p.Name,
					},
				})
			case sgptcoder.FilePart:
				switch p.Source.Type {
				case "file":
					attachments = append(attachments, &attachment.Attachment{
						ID:         p.ID,
						Type:       "file",
						Display:    p.Source.Text.Value,
						URL:        p.URL,
						Filename:   p.Filename,
						MediaType:  p.Mime,
						StartIndex: int(p.Source.Text.Start),
						EndIndex:   int(p.Source.Text.End),
						Source: &attachment.FileSource{
							Path: p.Source.Path,
							Mime: p.Mime,
						},
					})
				case "symbol":
					r := p.Source.Range.(sgptcoder.SymbolSourceRange)
					attachments = append(attachments, &attachment.Attachment{
						ID:         p.ID,
						Type:       "symbol",
						Display:    p.Source.Text.Value,
						URL:        p.URL,
						Filename:   p.Filename,
						MediaType:  p.Mime,
						StartIndex: int(p.Source.Text.Start),
						EndIndex:   int(p.Source.Text.End),
						Source: &attachment.SymbolSource{
							Path: p.Source.Path,
							Name: p.Source.Name,
							Kind: int(p.Source.Kind),
							Range: attachment.SymbolRange{
								Start: attachment.Position{
									Line: int(r.Start.Line),
									Char: int(r.Start.Character),
								},
								End: attachment.Position{
									Line: int(r.End.Line),
									Char: int(r.End.Character),
								},
							},
						},
					})
				}
			}
		}
		return &Prompt{
			Text:        text,
			Attachments: attachments,
		}, nil
	}
	return nil, errors.New("unknown message type")
}

func (m Message) ToSessionChatParams() []sgptcoder.SessionPromptParamsPartUnion {
	parts := []sgptcoder.SessionPromptParamsPartUnion{}
	for _, part := range m.Parts {
		switch p := part.(type) {
		case sgptcoder.TextPart:
			parts = append(parts, sgptcoder.TextPartInputParam{
				ID:        sgptcoder.F(p.ID),
				Type:      sgptcoder.F(sgptcoder.TextPartInputTypeText),
				Text:      sgptcoder.F(p.Text),
				Synthetic: sgptcoder.F(p.Synthetic),
				Time: sgptcoder.F(sgptcoder.TextPartInputTimeParam{
					Start: sgptcoder.F(p.Time.Start),
					End:   sgptcoder.F(p.Time.End),
				}),
			})
		case sgptcoder.FilePart:
			var source sgptcoder.FilePartSourceUnionParam
			switch p.Source.Type {
			case "file":
				source = sgptcoder.FileSourceParam{
					Type: sgptcoder.F(sgptcoder.FileSourceTypeFile),
					Path: sgptcoder.F(p.Source.Path),
					Text: sgptcoder.F(sgptcoder.FilePartSourceTextParam{
						Start: sgptcoder.F(int64(p.Source.Text.Start)),
						End:   sgptcoder.F(int64(p.Source.Text.End)),
						Value: sgptcoder.F(p.Source.Text.Value),
					}),
				}
			case "symbol":
				source = sgptcoder.SymbolSourceParam{
					Type: sgptcoder.F(sgptcoder.SymbolSourceTypeSymbol),
					Path: sgptcoder.F(p.Source.Path),
					Name: sgptcoder.F(p.Source.Name),
					Kind: sgptcoder.F(p.Source.Kind),
					Range: sgptcoder.F(sgptcoder.SymbolSourceRangeParam{
						Start: sgptcoder.F(sgptcoder.SymbolSourceRangeStartParam{
							Line:      sgptcoder.F(float64(p.Source.Range.(sgptcoder.SymbolSourceRange).Start.Line)),
							Character: sgptcoder.F(float64(p.Source.Range.(sgptcoder.SymbolSourceRange).Start.Character)),
						}),
						End: sgptcoder.F(sgptcoder.SymbolSourceRangeEndParam{
							Line:      sgptcoder.F(float64(p.Source.Range.(sgptcoder.SymbolSourceRange).End.Line)),
							Character: sgptcoder.F(float64(p.Source.Range.(sgptcoder.SymbolSourceRange).End.Character)),
						}),
					}),
					Text: sgptcoder.F(sgptcoder.FilePartSourceTextParam{
						Value: sgptcoder.F(p.Source.Text.Value),
						Start: sgptcoder.F(p.Source.Text.Start),
						End:   sgptcoder.F(p.Source.Text.End),
					}),
				}
			}
			parts = append(parts, sgptcoder.FilePartInputParam{
				ID:       sgptcoder.F(p.ID),
				Type:     sgptcoder.F(sgptcoder.FilePartInputTypeFile),
				Mime:     sgptcoder.F(p.Mime),
				URL:      sgptcoder.F(p.URL),
				Filename: sgptcoder.F(p.Filename),
				Source:   sgptcoder.F(source),
			})
		case sgptcoder.AgentPart:
			parts = append(parts, sgptcoder.AgentPartInputParam{
				ID:   sgptcoder.F(p.ID),
				Type: sgptcoder.F(sgptcoder.AgentPartInputTypeAgent),
				Name: sgptcoder.F(p.Name),
				Source: sgptcoder.F(sgptcoder.AgentPartInputSourceParam{
					Value: sgptcoder.F(p.Source.Value),
					Start: sgptcoder.F(p.Source.Start),
					End:   sgptcoder.F(p.Source.End),
				}),
			})
		}
	}
	return parts
}
