# jenkins-pipeline

Este projeto contém um pipeline do Jenkins para automatizar o processo de construção, teste e implantação de uma aplicação. 

## Estrutura do Projeto

- **Jenkinsfile**: Define o pipeline do Jenkins, incluindo as etapas de construção, teste e implantação.
- **scripts/deploy.sh**: Script de shell que contém os comandos necessários para implantar a aplicação.
- **tests/test.sh**: Script de shell que executa os testes automatizados da aplicação.

## Como Usar

1. Configure o Jenkins para usar o `Jenkinsfile` deste projeto.
2. Execute o script `deploy.sh` para implantar a aplicação.
3. Execute o script `test.sh` para rodar os testes automatizados.

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções.