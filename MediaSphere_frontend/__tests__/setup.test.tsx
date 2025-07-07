import { render, screen } from '@testing-library/react'

// Simple test to verify Jest setup
describe('Jest Setup', () => {
  it('should work with basic test', () => {
    const testDiv = document.createElement('div')
    testDiv.textContent = 'Hello World'
    document.body.appendChild(testDiv)
    
    expect(testDiv.textContent).toBe('Hello World')
  })
})
