###
# Declarando caminho, definições e pacotes
###

# Diretório do projeto, de onde serão salvos e lidos os arquivos
project_root_path <- paste0(getwd(), "/Aula1")

###
# Variáveis e definições
###
source(paste0(project_root_path, "/definitions.R"))

###
# Instalando e carregando pacotes
###
source(paste0(project_root_path, "/install_load_packages.R"),
       encoding = encoding)

View(diamonds)

diamonds$cut_num <- as.numeric(factor(diamonds$cut, levels = c("Fair", "Good", "Very Good", "Premium", "Ideal"), ordered = TRUE))
diamonds$clarity_num <- as.numeric(factor(diamonds$clarity, levels = c("I1", "SI2", "SI1", "VS2", "VS1", "VVS2", "VVS1", "IF"), ordered = TRUE))
diamonds$color_num <- as.numeric(factor(diamonds$color, levels = c("J", "I", "H", "G", "F", "E", "D"), ordered = TRUE))

numeric_vars <- diamonds[, sapply(diamonds, is.numeric)]
cor(numeric_vars, use = "complete.obs")[, "price"]

set.seed(123)

n <- nrow(diamonds)
train_indices <- sample(seq_len(n), size = 0.6 * n)
remaining_indices <- setdiff(seq_len(n), train_indices)
test_indices <- sample(remaining_indices, size = 0.5 * length(remaining_indices))
predict_indices <- setdiff(remaining_indices, test_indices)

train_data <- diamonds[train_indices, ]
test_data <- diamonds[test_indices, ]
predict_data <- diamonds[predict_indices, ]

# install.packages("rpart")
# library(rpart)
# 
# # tree_model <- rpart(price ~ carat + cut_num + color_num + clarity_num + depth + table + x + y + z, data = train_data)
# tree_model <- rpart(price ~ carat + x + y + z, data = train_data)
# plot(tree_model, uniform = TRUE, margin = 0.1)
# text(tree_model, use.n = TRUE, cex = 0.7)
# 
# predictions <- predict(tree_model, newdata = test_data)
# mean((test_data$price - predictions)^2)
# head(data.frame(Actual = test_data$price, Predicted = predictions))

install.packages("randomForest")
library(randomForest)

set.seed(123)
rf_model <- randomForest(price ~ carat + cut + color + clarity + depth + table + x + y + z,
                         data = train_data,
                         ntree = 100)
predictions <- predict(rf_model, newdata = test_data)
mean((test_data$price - predictions)^2)
head(data.frame(Actual = test_data$price, Predicted = predictions))
