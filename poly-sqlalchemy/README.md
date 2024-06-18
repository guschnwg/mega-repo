# Experimentation with Polymorphism in SQLAlchemy in some weird way

```
brew install pyenv
brew install pyenv-virtualenv
```

```
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
echo 'if which pyenv-virtualenv-init > /dev/null; then eval "$(pyenv virtualenv-init -)"; fi' >> ~/.bashrc
```

```
pyenv install 3.11
pyenv global 3.11
pyenv version
pyenv virtualenv poly

pip install -r requirements.txt
python main.py
```
