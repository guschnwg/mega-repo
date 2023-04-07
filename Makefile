ship:
	mkdir .ship; \
		cd tcc; \
		yarn; \
		yarn build; \
		mv build ../.ship/tcc; \
		cd ../.ship; \
		git init; \
		git remote add gh-pages https://github.com/guschnwg/mega-repo.git; \
		git checkout -b gh-pages; \
		git add -A; \
		git commit -m '🚢'; \
		git push -f; \
		cd ..; \
		rm -rf .ship;
