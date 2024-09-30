package logging

import (
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type Logger struct {
	output *log.Logger
}

func New() Logger {
	l := log.New(os.Stdout, "", 0)
	return Logger{
		output: l,
	}
}

func (l Logger) WithOutput(w io.Writer) Logger {
	l.output = log.New(w, "", 0)
	return l
}

type wrappedWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *wrappedWriter) WriteHeader(statusCode int) {
	w.ResponseWriter.WriteHeader(statusCode)
	w.statusCode = statusCode
}

func (l *Logger) Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &wrappedWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}
		next.ServeHTTP(wrapped, r)
		l.output.Printf("[%d] %s @ %s in %v", wrapped.statusCode, r.Method, r.URL.Path, time.Since(start))
	})
}
