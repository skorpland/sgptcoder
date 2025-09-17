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

func TestTuiAppendPromptWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.AppendPrompt(context.TODO(), sgptcoder.TuiAppendPromptParams{
		Text:      sgptcoder.F("text"),
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

func TestTuiClearPromptWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.ClearPrompt(context.TODO(), sgptcoder.TuiClearPromptParams{
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

func TestTuiExecuteCommandWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.ExecuteCommand(context.TODO(), sgptcoder.TuiExecuteCommandParams{
		Command:   sgptcoder.F("command"),
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

func TestTuiOpenHelpWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.OpenHelp(context.TODO(), sgptcoder.TuiOpenHelpParams{
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

func TestTuiOpenModelsWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.OpenModels(context.TODO(), sgptcoder.TuiOpenModelsParams{
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

func TestTuiOpenSessionsWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.OpenSessions(context.TODO(), sgptcoder.TuiOpenSessionsParams{
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

func TestTuiOpenThemesWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.OpenThemes(context.TODO(), sgptcoder.TuiOpenThemesParams{
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

func TestTuiShowToastWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.ShowToast(context.TODO(), sgptcoder.TuiShowToastParams{
		Message:   sgptcoder.F("message"),
		Variant:   sgptcoder.F(sgptcoder.TuiShowToastParamsVariantInfo),
		Directory: sgptcoder.F("directory"),
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

func TestTuiSubmitPromptWithOptionalParams(t *testing.T) {
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
	_, err := client.Tui.SubmitPrompt(context.TODO(), sgptcoder.TuiSubmitPromptParams{
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
