NAME = tandem-raise.zip
FILES = extension.js metadata.json

$(NAME):
	zip --junk-paths "$(NAME)" $(FILES)

clean:
	rm -f "$(NAME)"

