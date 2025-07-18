###
# Declarando caminho, definições e pacotes
###

# Diretório do projeto, de onde serão salvos e lidos os arquivos
project_root_path <- paste0(getwd(), "/Aula 7")

###
# Variáveis e definições
###
source(paste0(project_root_path, "/definitions.R"))

###
# Instalando e carregando pacotes
###
source(paste0(project_root_path, "/install_load_packages.R"), encoding = encoding)

dados <- read.csv(paste0(project_root_path, "/yulu_bike_sharing_dataset.csv"))
summary(dados)
str(dados)

dados <- dados %>%
  dplyr::mutate(
    season_factor = factor(
      season,
      levels = c(2, 3, 4, 1),
      labels = c("Primavera", "Verão", "Outono", "Inverno")
    ),
    holiday_factor = factor(holiday,
      levels = c(0, 1),
      labels = c("Não", "Sim")
    ),
    workingday_factor = factor(workingday,
      levels = c(0, 1),
      labels = c("Não", "Sim")
    ),
    weather_adj = dplyr::case_when(
      weather == 3 | weather == 4 ~ 3,
      TRUE ~ weather,
    ),
    weather_factor = factor(weather_adj,
      levels = c(1, 2, 3),
      labels = c("Céu limpo/parcialmente numblado", "Névoa + Nuvens", "Chuva")
    ),
    dia = lubridate::as_date(datetime),
    hora = lubridate::hour(datetime),
    ano_mes = lubridate::floor_date(dia, "month"),
    hora_cat = factor(
      case_when(
        between(hora, 6, 9) ~ "Manhã ini",
        between(hora, 10, 11) ~ "Manhã",
        between(hora, 12, 13) ~ "Tarde ini",
        between(hora, 14, 16) ~ "Tarde",
        between(hora, 17, 20) ~ "Fim do dia",
        TRUE ~ "Noite/Madrugada"
      ),
      levels = c("Manhã ini", "Manhã", "Tarde ini", "Tarde", "Fim do dia", "Noite/Madrugada")
    )
  )


str(dados)
table(dados$hora_cat, dados$hora)

dados %>%
  dplyr::select(-c(season, holiday, workingday, weather, datetime)) %>%
  skimr::skim()

uso_dia <- dados %>%
  dplyr::select(dia, count) %>%
  dplyr::group_by(dia) %>%
  dplyr::summarise(total_alugueis = sum(count)) %>%
  dplyr::ungroup()

plot(uso_dia$dia, uso_dia$total_alugueis, type = "l")

boxplot(dados$count ~ dados$season_factor)
boxplot(dados$count ~ dados$weather_adj)
boxplot(dados$count ~ dados$holiday_factor)
boxplot(dados$count ~ dados$weather_factor)
boxplot(dados$count ~ dados$workingday_factor)$stats
boxplot(dados$count ~ dados$hora_cat)$stats

plot(dados$humidity, dados$count)
cor(dados$count, dados$humidity)
plot(dados$windspeed, dados$count)
cor(dados$windspeed, dados$count)

plot(dados$hora_cat, dados$count)

plot(dados$temp, dados$count)
cor(dados$temp, dados$count)

plot(dados$atemp, dados$count)

plot(dados$registered, dados$count)
plot(dados$casual, dados$count)

# Existe diferença no total de viagens em dias da semana e feriados?
# H0: média de aluguéios por dia em feriados = média de aluguéis demais dias

q1 <- dados %>%
  dplyr::group_by(dia, holiday_factor) %>%
  dplyr::summarise(total = sum(count)) %>%
  dplyr::ungroup()

boxplot(q1$total ~ q1$holiday_factor)$stats
hist(q1 %>%
  dplyr::filter(holiday_factor == "Não") %>%
  dplyr::select(total) %>%
  dplyr::pull())

hist(q1 %>%
  dplyr::filter(holiday_factor == "Sim") %>%
  dplyr::select(total) %>%
  dplyr::pull())

car::qqPlot(
  q1 %>%
    dplyr::filter(holiday_factor == "Não") %>%
    dplyr::select(total) %>%
    dplyr::pull()
)

shapiro.test(
  q1 %>%
    dplyr::filter(holiday_factor == "Não") %>%
    dplyr::select(total) %>%
    dplyr::pull()
)

# Dados não são normais

wilcox.test(
  total ~ holiday_factor,
  data = q1, alternative = "two.sided"
)

car::qqPlot(
  q1 %>%
    dplyr::filter(holiday_factor == "Sim") %>%
    dplyr::select(total) %>%
    dplyr::pull()
)

shapiro.test(
  q1 %>%
    dplyr::filter(holiday_factor == "Sim") %>%
    dplyr::select(total) %>%
    dplyr::pull()
)






# Existe diferença no total de viagens em dias úteis ou não?
# H0: média de aluguéios por dia dias úteis  == média de aluguéis demais dias

q2 <- dados %>%
  dplyr::group_by(dia, workingday_factor) %>%
  dplyr::summarise(total = sum(count)) %>%
  dplyr::ungroup()

boxplot(q2$total ~ q2$workingday_factor)
hist(q2 %>%
  dplyr::filter(workingday_factor == "Não") %>%
  dplyr::select(total) %>%
  dplyr::pull())

car::qqPlot(q2 %>%
  dplyr::filter(workingday_factor == "Não") %>%
  dplyr::select(total) %>%
  dplyr::pull())

shapiro.test(q2 %>%
  dplyr::filter(workingday_factor == "Não") %>%
  dplyr::select(total) %>%
  dplyr::pull())

hist(q2 %>%
  dplyr::filter(workingday_factor == "Sim") %>%
  dplyr::select(total) %>%
  dplyr::pull())

car::qqPlot(q2 %>%
  dplyr::filter(workingday_factor == "Sim") %>%
  dplyr::select(total) %>%
  dplyr::pull())

shapiro.test(q2 %>%
  dplyr::filter(workingday_factor == "Sim") %>%
  dplyr::select(total) %>%
  dplyr::pull())

car::leveneTest(total ~ workingday_factor, data = q2)
res <- wilcox.test(total ~ workingday_factor, data = q2, alternative = "two.sided")
res$p.value > 0.05







# n média de aluguéis por dia verao
#  = média de aluguéis por dia primavera
#  = média de aluguéis por dia outono
#  = média de aluguéis por dia inverno

q3 <- dados %>%
  dplyr::group_by(dia, season_factor) %>%
  dplyr::summarise(total = sum(count)) %>%
  dplyr::ungroup()
boxplot(q3$total ~ q3$season_factor)
shapiro.test(q3$total[q3$season_factor == "Primavera"])$p.value > 0.05
car::leveneTest(total ~ season_factor, data = q3)$Pr
kruskal.test(total ~ season_factor, data = q3)$p.value > 0.05
dunn.test(q3$total, q3$season_factor, method = "bonferroni")



# Existe diferença no total de viagens entre as diferentes condições climáticas
# H0: MdApD de céu limpo = MdApD de névoa = MdApD de chuva

q4 <- dados %>%
  dplyr::group_by(dia, weather_factor) %>%
  dplyr::summarise(total = sum(count)) %>%
  dplyr::ungroup() %>%
  dplyr::group_by(dia) %>%
  dplyr::mutate(max = max(total)) %>%
  dplyr::filter(total == max)
q4
boxplot(q4$total ~ q4$weather_factor)
shapiro.test(q4$total[q4$weather_factor == "Céu limpo/parcialmente numblado"])
kruskal.test(total ~ weather_factor, data = q4)
dunn.test(q4$total, q4$weather_factor, method = "bonferroni")




# Existe correlação entre total de vendas/dias e velocidade do vento?
# H0: coef. correlação == 0

q5 <- dados %>%
  dplyr::group_by(dia) %>%
  dplyr::summarise(
    veloc_vento = median(windspeed),
    total = sum(count)
  )

plot(q5$veloc_vento, q5$total)
boxplot(q5$veloc_vento)
boxplot(q5$total)

cor.test(x = q5$veloc_vento, y = q5$total, method = "spearman")
