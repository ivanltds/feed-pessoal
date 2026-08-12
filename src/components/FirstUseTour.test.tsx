import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import FirstUseTour from './FirstUseTour'

describe('FirstUseTour Component', () => {
  it('não renderiza nada se isOpen for false', () => {
    const { container } = render(<FirstUseTour isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza o primeiro passo do tutorial quando isOpen for true', () => {
    render(<FirstUseTour isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText(/Sua Edição Diária Tem Fim/i)).toBeInTheDocument()
    expect(screen.getByText(/Passo 1 de 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Pular tutorial ✕/i)).toBeInTheDocument()
  })

  it('avançar passo ao clicar no botão de Próximo Passo', () => {
    render(<FirstUseTour isOpen={true} onClose={vi.fn()} />)

    const nextBtn = screen.getByRole('button', { name: /Próximo Passo/i })
    fireEvent.click(nextBtn)

    expect(screen.getByText(/Títulos Limpos & Fatos Diretos/i)).toBeInTheDocument()
    expect(screen.getByText(/Passo 2 de 4/i)).toBeInTheDocument()
  })

  it('chama onClose ao clicar em Pular tutorial', () => {
    const handleClose = vi.fn()
    render(<FirstUseTour isOpen={true} onClose={handleClose} />)

    const skipBtn = screen.getByText(/Pular tutorial ✕/i)
    fireEvent.click(skipBtn)

    expect(handleClose).toHaveBeenCalledOnce()
  })

  it('chama onClose ao pressionar a tecla Escape', () => {
    const handleClose = vi.fn()
    render(<FirstUseTour isOpen={true} onClose={handleClose} />)

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    expect(handleClose).toHaveBeenCalledOnce()
  })
})
