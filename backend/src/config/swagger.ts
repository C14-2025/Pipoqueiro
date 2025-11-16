import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Pipoqueiro',
      version: '1.0.0',
      description: 'Documentação completa da API do Pipoqueiro - Plataforma de reviews e recomendações de filmes',
      contact: {
        name: 'Time Pipoqueiro',
        email: 'contato@pipoqueiro.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido após login/registro'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Erro ao processar requisição'
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nome: {
              type: 'string',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              example: 'joao@example.com'
            },
            bio: {
              type: 'string',
              nullable: true,
              example: 'Amante de cinema'
            },
            foto_perfil: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/foto.jpg'
            },
            generos_favoritos: {
              type: 'array',
              items: {
                type: 'string'
              },
              nullable: true,
              example: ['Ação', 'Ficção']
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              nullable: true,
              example: '1990-01-01'
            }
          }
        },
        Filme: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 550
            },
            title: {
              type: 'string',
              example: 'Clube da Luta'
            },
            overview: {
              type: 'string',
              example: 'Um funcionário de escritório insone...'
            },
            vote_average: {
              type: 'number',
              format: 'float',
              example: 4.2,
              description: 'Nota de 0 a 5 (escala Pipoqueiro)'
            },
            vote_count: {
              type: 'integer',
              example: 1500
            },
            poster_path: {
              type: 'string',
              example: '/poster.jpg'
            },
            poster_url: {
              type: 'string',
              example: 'https://image.tmdb.org/t/p/w500/poster.jpg'
            },
            release_date: {
              type: 'string',
              format: 'date',
              example: '1999-10-15'
            }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            usuario_id: {
              type: 'integer',
              example: 1
            },
            tmdb_id: {
              type: 'integer',
              example: 550
            },
            nota: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5
            },
            titulo_review: {
              type: 'string',
              example: 'Obra-prima do cinema'
            },
            comentario: {
              type: 'string',
              example: 'Um dos melhores filmes que já vi'
            },
            spoiler: {
              type: 'boolean',
              example: false
            },
            curtidas: {
              type: 'integer',
              example: 10
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Usuários',
        description: 'Gerenciamento de usuários e autenticação'
      },
      {
        name: 'Filmes',
        description: 'Busca e informações sobre filmes'
      },
      {
        name: 'Reviews',
        description: 'Avaliações e comentários sobre filmes'
      },
      {
        name: 'Favoritos',
        description: 'Gerenciamento de filmes favoritos'
      },
      {
        name: 'Watchlist',
        description: 'Lista "Quero Ver"'
      },
      {
        name: 'Chat',
        description: 'Chat com IA para recomendações'
      },
      {
        name: 'Sistema',
        description: 'Endpoints do sistema'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/config/swagger-docs.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
