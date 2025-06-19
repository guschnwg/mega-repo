###
# Definição caminho, definições e pacotes
###

# Diretório do projeto, de onde serão salvos e lidos os arquivos
project_root_path <- paste0(getwd(), "/Aula 5")

###
# Variáveis e definições
###
source(paste0(project_root_path, "/definitions.R"))

###
# Instalando e carregando pacotes
###
source(paste0(project_root_path, "/install_load_packages.R"), encoding = encoding)

##############
#   AULA 5
##############

## QQ plot
dados <- MASS::birthwt

hist(dados$bwt, xlab = "Peso ao nascimento (gramas)", ylab = "Frequência", main = "")
### Uma forma...
stats::qqnorm(dados$bwt,
  ylab = "Peso no nascimento (gramas)",
  xlab = "Quantis normais",
  col = "darkgreen"
)
stats::qqline(dados$bwt,
  col = "red"
)

### Outra...
car::qqPlot(dados$bwt,
  # id = FALSE,
  # grid = FALSE,
  col.lines = "red",
  col = "dark green",
  # lwd = 1,
  ylab = "Peso no nascimento (gramas)",
  xlab = "Quantis normais",
  main = "Normal Q-Q Plot"
)

## E finalizamos com transformações de variáveis...
### Vamos reproduzir o exemplo da aula teórica e aprender um pouco de dplyr?
# Sugestão: calcular manualmente e comparar padronização e normalização; criar categorias de peso
dados_adj <- dados %>%
  dplyr::mutate(
    peso_mae = lwt * .453592, # transformando de libras para kg
    peso_mae_log = log(peso_mae),
    peso_mae_invneg = -1 / (peso_mae),
    peso_mae_raiz2 = sqrt(peso_mae),
    peso_mae_raiz3 = (peso_mae)^(1 / 3),
    peso_pad = scale(peso_mae),
    peso_pad_calc = (peso_mae - mean(peso_mae)) / sd(peso_mae),
    peso_nor = scales::rescale(peso_mae),
    peso_nor_calc = (peso_mae - min(peso_mae)) / (max(peso_mae) - min(peso_mae)),
    peso_mae_cat = dplyr::case_when(
      peso_mae <= 49 ~ "<= 49kg",
      peso_mae > 49 & peso_mae <= 60 ~ ">49 e <= 60kg",
      peso_mae > 60 ~ "> 60kg"
    )
  )

table(dados_adj$peso_pad == dados_adj$peso_pad_calc)
table(dados_adj$peso_nor == dados_adj$peso_nor_calc)
dados_adj %>%
  group_by(peso_mae_cat) %>%
  tally()
dados_adj %>%
  group_by(peso_mae_cat) %>%
  summarise(
    min = min(peso_mae),
    max = max(peso_mae)
  )

windows()
par(mfrow = c(2, 3))
hist(dados_adj$peso_mae, xlab = "Peso da mãe", ylab = "Frequência", main = "Variável original")
hist(dados_adj$peso_mae_log, xlab = "Log(Peso da mãe)", ylab = "Frequência", main = "Variável transformada - LOG")
hist(dados_adj$peso_mae_invneg, xlab = "-1/Peso da mãe", ylab = "Frequência", main = "Variável transformada - -1/x")
hist(dados_adj$peso_mae_raiz2, xlab = expression(sqrt("Peso da mãe")), ylab = "Frequência", main = "Variável transformada - Raiz quadrada")
hist(dados_adj$peso_mae_raiz3, xlab = expression(sqrt("Peso da mãe", 3)), ylab = "Frequência", main = "Variável transformada - Raiz cúbica")
hist(dados_adj$peso_pad, xlab = "Peso da mãe padronizado", ylab = "Frequência", main = "Variável transformada - Z escore")

### Tente reproduzir os qqplots
windows()
par(mfrow = c(2, 3))

car::qqPlot(dados_adj$peso_mae,
  id = FALSE,
  grid = FALSE,
  ylab = "Peso da mãe",
  xlab = "Quantis normais",
  col = "dark green",
  main = "Variável original"
)

car::qqPlot(dados_adj$peso_mae_log,
  id = FALSE,
  grid = FALSE,
  ylab = "Log(Peso da mãe)",
  xlab = "Quantis normais",
  col = "dark green",
  main = "Variável transformada - LOG"
)

car::qqPlot(dados_adj$peso_mae_invneg,
  id = FALSE,
  grid = FALSE,
  ylab = "-1/Peso da mãe",
  xlab = "Quantis normais",
  col = "dark green",
  main = "Variável transformada - -1/x"
)

car::qqPlot(dados_adj$peso_mae_raiz2,
  id = FALSE,
  grid = FALSE,
  ylab = expression(sqrt("Peso da mãe")),
  xlab = "Quantis normais",
  col = "dark green",
  main = "Variável transformada - Raiz quadrada"
)

car::qqPlot(dados_adj$peso_mae_raiz3,
  id = FALSE,
  grid = FALSE,
  ylab = expression(sqrt("Peso da mãe", 3)),
  xlab = "Quantis normais",
  col = "dark green",
  main = "Variável transformada - Raiz cúbica"
)

dev.off()

### Cálculo de tamanho de amostra (outra opção: Winpepi)
### Referência auxiliar: https://www.lume.ufrgs.br/handle/10183/175312
### Exemplo para média: qual é o tamanho de amostra necessário para estimar o ticket médio de clientes de uma nova loja da sua empresa?
### Sabe-se que, em lojas localizadas em regiões similares, a média e o desvio padrão do ticket médio são de R$ 200,00 e R$ 50,00, respectivamente.
### Vamos considerar um erro de R$ 10,00 e confiança de 95%.

samplingbook::sample.size.mean(e = 10, S = 50, level = 0.95)
samplingbook::sample.size.mean(e = 10, S = 50, level = 0.95, N = 530) # correção para população finita

### Exemplo para proporção: um engenheiro de qualidade deseja conhecer a proporção de peças defeitusosas da fábrica automotiva
### em que trabalha na produção de uma semana supondo um nível de confiança de 95% e margem de erro de 0,05.
### Para isso, considerou estudos passados da fábrica e utilizou uma proporção de 0,1 de peças defeituosas (a cada 100 peças produzidas,
### 10 são defeituosas.

samplingbook::sample.size.prop(e = 0.05, P = 0.1, level = 0.95)
### Agora suponha que nessa fábrica, por semana, são produzidas 1500 peças.
samplingbook::sample.size.prop(e = 0.05, P = 0.1, level = 0.95, N = 1500)
