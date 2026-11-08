import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { alert, confirm, prompt } from '../src'

afterEach(() => {
    document.querySelectorAll('dialog').forEach((d) => d.remove())
})

const dialog = () => document.querySelector('dialog')!
const button = (text: string) => [...dialog().querySelectorAll('button')].find((b) => b.textContent === text)!

describe('alert', () => {
    it('resolves when OK is clicked and removes the dialog', async () => {
        const done = alert('Hello', { okText: 'Got it' })
        expect(dialog().textContent).toContain('Hello')
        await userEvent.click(button('Got it'))
        await done
        expect(document.querySelector('dialog')).toBeNull()
    })
})

describe('confirm', () => {
    it('is exposed as an alertdialog', () => {
        void confirm('Sure?')
        expect(dialog().getAttribute('role')).toBe('alertdialog')
    })

    it('resolves true for OK', async () => {
        const result = confirm('Sure?')
        await userEvent.click(button('OK'))
        expect(await result).toBe(true)
    })

    it('resolves false for Cancel and uses custom labels', async () => {
        const result = confirm('Sure?', { cancelText: 'Nope', okText: 'Yep' })
        expect(button('Yep')).toBeDefined()
        await userEvent.click(button('Nope'))
        expect(await result).toBe(false)
    })

    it('resolves false on Escape', async () => {
        const result = confirm('Sure?')
        await userEvent.keyboard('{Escape}')
        expect(await result).toBe(false)
    })

    it('focuses OK by default', () => {
        void confirm('Sure?')
        expect(document.activeElement).toBe(button('OK'))
    })
})

describe('prompt', () => {
    it('resolves the entered value', async () => {
        const result = prompt('Name?')
        const input = dialog().querySelector('input')!
        expect(document.activeElement).toBe(input)
        await userEvent.fill(input, 'Alex')
        await userEvent.click(button('OK'))
        expect(await result).toBe('Alex')
    })

    it('submits with Enter', async () => {
        const result = prompt('Name?', { defaultValue: 'preset' })
        await userEvent.keyboard('{Enter}')
        expect(await result).toBe('preset')
    })

    it('resolves null on Cancel, even if the input is invalid', async () => {
        const result = prompt('Name?', { inputAttributes: { required: '' } })
        await userEvent.click(button('Cancel'))
        expect(await result).toBeNull()
    })

    it('resolves null on Escape', async () => {
        const result = prompt('Name?')
        await userEvent.keyboard('{Escape}')
        expect(await result).toBeNull()
    })

    it('applies input attributes and validation', async () => {
        const result = prompt('Mail?', { inputAttributes: { type: 'email', required: '' } })
        expect(dialog().querySelector('input')!.type).toBe('email')
        await userEvent.click(button('OK'))
        expect(dialog()).toBeDefined()
        await userEvent.fill(dialog().querySelector('input')!, 'a@b.de')
        await userEvent.click(button('OK'))
        expect(await result).toBe('a@b.de')
    })
})
