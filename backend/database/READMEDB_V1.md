**### Banco de dados: Pipoqueiro** 



\- Esse banco foi criado com o intuito de armazenar os dados de uma aplicação web de avaliações de filmes, contendo dados de usuários, dados de avaliações e dados de listagem de filmes.



**### Tecnologia usada**



\- MySQL 8.0

\- MySQL Workbench





**### Tabelas**

\*\*usuários\*\*

&nbsp;id INT AUTO\_INCREMENT PRIMARY KEY,

&nbsp;   nome VARCHAR(100) NOT NULL,                   

&nbsp;   email VARCHAR(100) UNIQUE NOT NULL,             

&nbsp;   senha\_hash VARCHAR(255) NOT NULL,              

&nbsp;   bio TEXT,                                     

&nbsp;   foto\_perfil VARCHAR(500),                      

&nbsp;   generos\_favoritos JSON,                        

&nbsp;   data\_nascimento DATE,                          

&nbsp;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP



\*\*avaliacoes\*\*

&nbsp;id INT AUTO\_INCREMENT PRIMARY KEY,

&nbsp;   usuario\_id INT NOT NULL,                       

&nbsp;   tmdb\_id INT NOT NULL,                         

&nbsp;   nota INT CHECK (nota >= 1 AND nota <= 5),     

&nbsp;   titulo\_review VARCHAR(200),                    

&nbsp;   comentario TEXT,                               

&nbsp;   spoiler BOOLEAN DEFAULT FALSE,                 

&nbsp;   curtidas INT DEFAULT 0,                        

&nbsp;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&nbsp;   

&nbsp;   FOREIGN KEY (usuario\_id) REFERENCES usuarios(id) ON DELETE CASCADE,

&nbsp;   UNIQUE KEY unique\_user\_movie (usuario\_id, tmdb\_id)  -- Usuário só pode avaliar 1x



\*\*lista\_quero\_ver\*\*

&nbsp;id INT AUTO\_INCREMENT PRIMARY KEY,

&nbsp;   usuario\_id INT NOT NULL,                       

&nbsp;   tmdb\_id INT NOT NULL,                          

&nbsp;   prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',  

&nbsp;   data\_adicao TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   notificar\_lancamento BOOLEAN DEFAULT TRUE,     

&nbsp;   onde\_assistir VARCHAR(500),                    

&nbsp;   

&nbsp;   FOREIGN KEY (usuario\_id) REFERENCES usuarios(id) ON DELETE CASCADE,

&nbsp;   UNIQUE KEY unique\_user\_movie\_watchlist (usuario\_id, tmdb\_id)  -- Não duplicar filme







**# Criar o banco**

sql

CREATE DATABASE pipoqueiro;



**# Importar o schema**

bash

mysql -u root -p pipoqueiro < schema.sql



**# Exemplos de consulta**

sql

SELECT 'Usuários criados:' as status, COUNT(\*) as total FROM usuarios;

SELECT 'Reviews criadas:' as status, COUNT(\*) as total FROM avaliacoes;  

SELECT 'Filmes na watchlist:' as status, COUNT(\*) as total FROM lista\_quero\_ver;







**#Observações**

-Cada usuário pode avaliar um filme uma única vez

-Um usuário pode ter vários filmes na lista\_quero\_ver





