SOURCE=./...
SUBDOMAIN=ruzz311-find
PORT=8003

.PHONY: serve exposed_server

getdeps:
	go get ./...

build: getdeps
	go build -v ./...

test: build
	go test $(source)

install: build
	godep go install -v -ldflags "-X github.com/c2fo/wfc/lib/utils.SHA=`git rev-parse HEAD` -X github.com/c2fo/wfc/lib/utils.BUILD_DATE=`date -u +%Y-%m-%d:%H:%M:%S%z`" $(SOURCE)

open_exposed:
	open https://$(SUBDOMAIN).ngrok.io

serve: build
	./find

expose_server: serve
	ngrok http -subdomain=$(SUBDOMAIN) $(PORT)

serve_exposed: expose_server
	open https://$(SUBDOMAIN).ngrok.io
