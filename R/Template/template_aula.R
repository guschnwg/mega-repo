###
# Declarando caminho, definições e pacotes
###

# Diretório do projeto, de onde serão salvos e lidos os arquivos
project_root_path <- paste0(getwd(), "/Template")

###
# Variáveis e definições
###
source(paste0(project_root_path, "/definitions.R"))

###
# Instalando e carregando pacotes 
###
source(paste0(project_root_path, "/install_load_packages.R"), encoding = encoding)
