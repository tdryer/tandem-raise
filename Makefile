NAME = tandem-raise@tomdryer.com
FILES = extension.js metadata.json

$(NAME).zip: $(FILES)
	zip --junk-paths "$(NAME).zip" $(FILES)

install: $(NAME).zip
	unzip "$(NAME).zip" -d "$(HOME)/.local/share/gnome-shell/extensions/$(NAME)/"

clean:
	rm -f "$(NAME).zip"
