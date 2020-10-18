import { google } from 'googleapis'
import express from 'express'
import 'colors'
import { OAuth2Client } from 'googleapis-common'
export function authenticate(): Promise<OAuth2Client> {
  return new Promise(resolve => {
    function createHttpServer() {
      const server = express()
      return server
    }
    function createOAuthClient() {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:5000/oauth/callback'
      )
      return oauth2Client
    }
    const server = createHttpServer()
    const oauthClient = createOAuthClient()
    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly'
      ]
    })
    server.get('/oauth/callback', async (request, response) => {
      const { code } = request.query
      response.send('OK Retorne para o Terminal')
      console.log('Aguarde finalizando a autenticação...')
      const { tokens } = await oauthClient.getToken(code as string)
      oauthClient.setCredentials(tokens)
      const userData = (
        await oauthClient.verifyIdToken({
          idToken: tokens.id_token as string,
          audience: process.env.GOOGLE_CLIENT_ID
        })
      ).getPayload()

      console.log('Logado como:' + userData?.email?.underline)
      console.log('Seja bem vindo ' + userData?.name?.underline)

      resolve(oauthClient)
    })
    server.listen(5000, () => {
      console.log(
        'Olá seja bem vindo, preciso que você faça login com o Google:\n' +
          authUrl.underline
      )
    })
  })
}
