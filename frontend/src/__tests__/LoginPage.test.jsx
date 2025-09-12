
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../Pages/LoginPage';
import * as api from '../services/api';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../services/api');

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};
// Testes automatizados para a página de Login e Cadastro
// Cada teste verifica um comportamento ou renderização específica da interface
// Os testes usam React Testing Library e Jest

describe('LoginPage', () => {
  // Testa se o formulário de login envia corretamente os dados ao clicar em "Entrar"
  test('envia formulário de login com sucesso', async () => {
    api.authService.login.mockResolvedValue({ success: true });
    renderWithRouter(<LoginPage />);
  // Garantir que a aba de login está ativa
  fireEvent.click(screen.getByText(/já tenho conta/i));
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@email.com' } });
  fireEvent.change(screen.getAllByPlaceholderText(/senha/i)[0], { target: { value: '123456' } });
  const btnEntrar = screen.getByRole('button', { name: /entrar/i });
  fireEvent.click(btnEntrar);
    await waitFor(() => expect(api.authService.login).toHaveBeenCalled());
  });

  // Testa se a mensagem de erro aparece ao falhar o login
  test('exibe mensagem de erro ao falhar login', async () => {
    api.authService.login.mockRejectedValue({ message: 'Erro' });
    renderWithRouter(<LoginPage />);
  fireEvent.click(screen.getByText(/já tenho conta/i));
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@email.com' } });
  fireEvent.change(screen.getAllByPlaceholderText(/senha/i)[0], { target: { value: '123456' } });
  const btnEntrar = screen.getByRole('button', { name: /entrar/i });
  fireEvent.click(btnEntrar);
    expect(await screen.findByText('Email ou senha incorretos. Por favor, tente novamente.')).toBeInTheDocument();
  });

  // Testa se o formulário de cadastro envia corretamente os dados ao clicar em "Cadastrar-se"
  test('envia formulário de cadastro com sucesso', async () => {
    api.authService.register.mockResolvedValue({ success: true });
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByText(/cadastrar-se/i));
  fireEvent.change(screen.getByPlaceholderText(/nome/i), { target: { value: 'User' } });
  fireEvent.change(screen.getByPlaceholderText(/^email/i), { target: { value: 'user@email.com' } });
  fireEvent.change(screen.getAllByPlaceholderText(/senha/i)[0], { target: { value: '123456' } });
  fireEvent.change(screen.getAllByPlaceholderText(/senha/i)[1], { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/cadastrar-se/i));
    await waitFor(() => expect(api.authService.register).toHaveBeenCalled());
  });

  // Testa se o botão de cadastro está visível na tela
  test('exibe botão de cadastro', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText(/cadastrar-se/i)).toBeInTheDocument();
  });

  // Testa se o título de cadastro aparece por padrão ao abrir a página
  test('renderiza título de cadastro por padrão', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText(/crie sua conta/i)).toBeInTheDocument();
  });

  // Testa se ao clicar na aba de login, o título muda para "Bem-vindo de volta!"
  test('troca para aba de login ao clicar', () => {
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByText(/já tenho conta/i));
    expect(screen.getByText(/bem-vindo de volta/i)).toBeInTheDocument();
  });

  // Testa se o campo "nome completo" só aparece na aba de cadastro
  test('exibe campo nome apenas na aba de cadastro', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByPlaceholderText(/nome completo/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/já tenho conta/i));
    expect(screen.queryByPlaceholderText(/nome completo/i)).not.toBeInTheDocument();
  });

});
