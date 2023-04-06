ship:
	git push origin -d gh-pages \
	git branch -d gh-pages \
	cd tcc; \
	yarn; \
	yarn build; \
	git checkout --orphan gh-pages \
	git rm -rf .