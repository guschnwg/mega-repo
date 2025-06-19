#####################
## INSTALAR PACOTES
####################



# Definição dos pacotes que serão utilizados
.packages <-
  c(
    "dplyr",
    "ggplot2",
    "corrplot",
    "stats",
    "readxl",
    "graphics",
    "MASS",
    "car",
    "samplingbook",
    "truncnorm",
    "dunn.test",
    "lubridate",
    "skimr",
    "nortest"
  )


# Verificar quais dos pacotes necessários já estão instalados.
.inst <- .packages %in% utils::installed.packages()

# Se o vetor de pacotes não instalados (diferença entre os pacotes de interesse e os
# pacotes instalados) tiver tamanho maior que 0, instalar apenas os pacotes não instalados
if (base::length(.packages[!.inst]) > 0) {
  message("Instalando pacotes que você ainda não tem no seu ambiente...")
  utils::install.packages(.packages[!.inst])
  message("Pacotes instalados....")
} else {
  message("Seu ambiente já tem os pacotes necessários...")
}


######
## CARREGAR PACOTES
######


# carregar pacotes no ambiente
for (package in 1:length(.packages)) {
  suppressWarnings(suppressMessages(require(.packages[package], character.only = TRUE)))
}

message("Seus pacotes estão carregados. Bom trabalho!")
