ship:
	mkdir .ship; \
		cd tcc; \
		yarn; \
		yarn build; \
		mv build ../.ship/tcc; \
		cd ..; \
		cd financing-calculator; \
		yarn; \
		yarn build; \
		mv build ../.ship/financing-calculator; \
		cd ../.ship; \
		git init; \
		git remote add gh-pages git@github.com:guschnwg/mega-repo.git; \
		git checkout -b gh-pages; \
		git add -A; \
		git commit -m '🚢'; \
		git push -f; \
		cd ..; \
		rm -rf .ship;
