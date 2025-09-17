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

func TestFileListWithOptionalParams(t *testing.T) {
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
	_, err := client.File.List(context.TODO(), sgptcoder.FileListParams{
		Path:      sgptcoder.F("path"),
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

func TestFileReadWithOptionalParams(t *testing.T) {
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
	_, err := client.File.Read(context.TODO(), sgptcoder.FileReadParams{
		Path:      sgptcoder.F("path"),
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

func TestFileStatusWithOptionalParams(t *testing.T) {
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
	_, err := client.File.Status(context.TODO(), sgptcoder.FileStatusParams{
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
