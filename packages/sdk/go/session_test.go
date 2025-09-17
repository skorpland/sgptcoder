// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package sgptcoder_test

import (
	"context"
	"errors"
	"os"
	"testing"

	"github.com/skorpland/sgptcoder-sdk-go"
	"github.com/skorpland/sgptcoder-sdk-go/internal/testutil"
	"github.com/skorpland/sgptcoder-sdk-go/option"
)

func TestSessionNewWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.New(context.TODO(), sgptcoder.SessionNewParams{
		Directory: sgptcoder.F("directory"),
		ParentID:  sgptcoder.F("parentID"),
		Title:     sgptcoder.F("title"),
	})
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionUpdateWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Update(
		context.TODO(),
		"id",
		sgptcoder.SessionUpdateParams{
			Directory: sgptcoder.F("directory"),
			Title:     sgptcoder.F("title"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionListWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.List(context.TODO(), sgptcoder.SessionListParams{
		Directory: sgptcoder.F("directory"),
	})
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionDeleteWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Delete(
		context.TODO(),
		"id",
		sgptcoder.SessionDeleteParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionAbortWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Abort(
		context.TODO(),
		"id",
		sgptcoder.SessionAbortParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionChildrenWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Children(
		context.TODO(),
		"id",
		sgptcoder.SessionChildrenParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionCommandWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Command(
		context.TODO(),
		"id",
		sgptcoder.SessionCommandParams{
			Arguments: sgptcoder.F("arguments"),
			Command:   sgptcoder.F("command"),
			Directory: sgptcoder.F("directory"),
			Agent:     sgptcoder.F("agent"),
			MessageID: sgptcoder.F("msgJ!"),
			Model:     sgptcoder.F("model"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionGetWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Get(
		context.TODO(),
		"id",
		sgptcoder.SessionGetParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionInitWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Init(
		context.TODO(),
		"id",
		sgptcoder.SessionInitParams{
			MessageID:  sgptcoder.F("messageID"),
			ModelID:    sgptcoder.F("modelID"),
			ProviderID: sgptcoder.F("providerID"),
			Directory:  sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionMessageWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Message(
		context.TODO(),
		"id",
		"messageID",
		sgptcoder.SessionMessageParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionMessagesWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Messages(
		context.TODO(),
		"id",
		sgptcoder.SessionMessagesParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionPromptWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Prompt(
		context.TODO(),
		"id",
		sgptcoder.SessionPromptParams{
			Parts: sgptcoder.F([]sgptcoder.SessionPromptParamsPartUnion{sgptcoder.TextPartInputParam{
				Text:      sgptcoder.F("text"),
				Type:      sgptcoder.F(sgptcoder.TextPartInputTypeText),
				ID:        sgptcoder.F("id"),
				Synthetic: sgptcoder.F(true),
				Time: sgptcoder.F(sgptcoder.TextPartInputTimeParam{
					Start: sgptcoder.F(0.000000),
					End:   sgptcoder.F(0.000000),
				}),
			}}),
			Directory: sgptcoder.F("directory"),
			Agent:     sgptcoder.F("agent"),
			MessageID: sgptcoder.F("msgJ!"),
			Model: sgptcoder.F(sgptcoder.SessionPromptParamsModel{
				ModelID:    sgptcoder.F("modelID"),
				ProviderID: sgptcoder.F("providerID"),
			}),
			System: sgptcoder.F("system"),
			Tools: sgptcoder.F(map[string]bool{
				"foo": true,
			}),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionRevertWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Revert(
		context.TODO(),
		"id",
		sgptcoder.SessionRevertParams{
			MessageID: sgptcoder.F("msgJ!"),
			Directory: sgptcoder.F("directory"),
			PartID:    sgptcoder.F("prtJ!"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionShareWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Share(
		context.TODO(),
		"id",
		sgptcoder.SessionShareParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionShellWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Shell(
		context.TODO(),
		"id",
		sgptcoder.SessionShellParams{
			Agent:     sgptcoder.F("agent"),
			Command:   sgptcoder.F("command"),
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionSummarizeWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Summarize(
		context.TODO(),
		"id",
		sgptcoder.SessionSummarizeParams{
			ModelID:    sgptcoder.F("modelID"),
			ProviderID: sgptcoder.F("providerID"),
			Directory:  sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionUnrevertWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Unrevert(
		context.TODO(),
		"id",
		sgptcoder.SessionUnrevertParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}

func TestSessionUnshareWithOptionalParams(t *testing.T) {
	t.Skip("Prism tests are disabled")
	baseURL := "http://localhost:4010"
	if envURL, ok := os.LookupEnv("TEST_API_BASE_URL"); ok {
		baseURL = envURL
	}
	if !testutil.CheckTestServer(t, baseURL) {
		return
	}
	client := sgptcoder.NewClient(
		option.WithBaseURL(baseURL),
	)
	_, err := client.Session.Unshare(
		context.TODO(),
		"id",
		sgptcoder.SessionUnshareParams{
			Directory: sgptcoder.F("directory"),
		},
	)
	if err != nil {
		var apierr *sgptcoder.Error
		if errors.As(err, &apierr) {
			t.Log(string(apierr.DumpRequest(true)))
		}
		t.Fatalf("err should be nil: %s", err.Error())
	}
}
