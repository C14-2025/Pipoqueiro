import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import LoginPage from '../Pages/LoginPage';
import * as api from '../services/api';
import { BrowserRouter } from 'react-router-dom';
import { UserListsProvider } from '../context/UserListsContext'; 

jest.mock('../services/api');

const renderWithProviders = (ui) => {
  return render(
    <UserListsProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </UserListsProvider>
  );
};

describe('LoginPage', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('envia formulário de login com sucesso', async () => {
    api.authService.login.mockResolvedValue({ token: 'fake-token' });
    renderWithProviders(<LoginPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /já tenho conta/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: '123456' } });
    const btnEntrar = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(btnEntrar);

    await waitFor(() => {
      expect(api.authService.login).toHaveBeenCalledWith('test@email.com', '123456');
    });
  });

  test('exibe mensagem de erro ao falhar login', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    api.authService.login.mockRejectedValue({ message: 'Erro' });
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /já tenho conta/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    expect(await screen.findByText('Erro ao fazer login. Tente novamente.')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  test('envia formulário de cadastro com sucesso', async () => {
    api.authService.register.mockResolvedValue({ token: 'fake-token' });
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/^email$/i), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/^senha$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmar senha/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /cadastrar-se/i }));

    await waitFor(() => {
        expect(api.authService.register).toHaveBeenCalled();
    });
  });

  test('exibe botão de cadastro', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/cadastre-se/i)).toBeInTheDocument();
  });

  test('renderiza título de cadastro por padrão', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('heading', { name: /crie sua conta/i })).toBeInTheDocument();
  });

  test('troca para aba de login ao clicar', () => {
    renderWithProviders(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /já tenho conta/i }));
    expect(screen.getByRole('heading', { name: /bem-vindo de volta/i })).toBeInTheDocument();
  });

  test('exibe campo nome apenas na aba de cadastro', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText(/nome completo/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /já tenho conta/i }));
    expect(screen.queryByPlaceholderText(/nome completo/i)).not.toBeInTheDocument();
  });

});