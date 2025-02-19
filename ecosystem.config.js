module.exports = {
    apps: [
      {
        name: "formit-backend",
        script: "app.js",
        env: {
          DB_NAME: "database-formit-aws",
          DB_USERNAME: "postgres",
          DB_PASSWORD: "Drinkmoneycarpet",
          DB_HOST: "database-formit-aws.citg7zznvjrx.us-east-2.rds.amazonaws.com"
        }
      }
    ]
  }
  