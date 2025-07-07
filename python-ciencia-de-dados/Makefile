setup:
	python3 -m venv venv || true
	sh ./venv/bin/activate
	pip install jupyter
	pip install seaborn matplotlib pandas numpy

run:
	sh ./venv/bin/activate
	jupyter notebook --IdentityProvider.token=""
