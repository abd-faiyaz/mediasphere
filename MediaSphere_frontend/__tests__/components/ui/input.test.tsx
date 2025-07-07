import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Input Component', () => {
  it('renders input with default type', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders input with specified type', () => {
    render(<Input type="email" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders input with password type', () => {
    render(<Input type="password" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renders input with number type', () => {
    render(<Input type="number" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('applies default classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-base'
    )
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    
    await user.type(input, 'test value')
    expect(input.value).toBe('test value')
  })

  it('handles onChange event', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    const input = screen.getByTestId('input')
    
    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('handles onFocus event', async () => {
    const user = userEvent.setup()
    const handleFocus = jest.fn()
    render(<Input onFocus={handleFocus} data-testid="input" />)
    const input = screen.getByTestId('input')
    
    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('handles onBlur event', async () => {
    const user = userEvent.setup()
    const handleBlur = jest.fn()
    render(<Input onBlur={handleBlur} data-testid="input" />)
    const input = screen.getByTestId('input')
    
    await user.click(input)
    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter your name" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('placeholder', 'Enter your name')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
  })

  it('is readonly when readOnly prop is true', () => {
    render(<Input readOnly data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('readonly')
  })

  it('handles controlled input with value prop', () => {
    const { rerender } = render(<Input value="initial" data-testid="input" onChange={() => {}} />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('initial')
    
    rerender(<Input value="updated" data-testid="input" onChange={() => {}} />)
    expect(input.value).toBe('updated')
  })

  it('handles defaultValue prop', () => {
    render(<Input defaultValue="default text" data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('default text')
  })

  it('handles required attribute', () => {
    render(<Input required data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('required')
  })

  it('handles name attribute', () => {
    render(<Input name="username" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('name', 'username')
  })

  it('handles id attribute', () => {
    render(<Input id="user-input" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('id', 'user-input')
  })

  it('handles min and max attributes for number input', () => {
    render(<Input type="number" min="0" max="100" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('handles maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('handles aria attributes', () => {
    render(
      <Input 
        aria-label="Search input" 
        aria-describedby="search-help" 
        data-testid="input" 
      />
    )
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('aria-label', 'Search input')
    expect(input).toHaveAttribute('aria-describedby', 'search-help')
  })

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn()
    const handleKeyUp = jest.fn()
    render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-testid="input" />)
    const input = screen.getByTestId('input')
    
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyUp(input, { key: 'Enter' })
    
    expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }))
    expect(handleKeyUp).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }))
  })

  it('handles form submission', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    render(
      <form onSubmit={handleSubmit}>
        <Input data-testid="input" />
        <button type="submit">Submit</button>
      </form>
    )
    
    const input = screen.getByTestId('input')
    const button = screen.getByRole('button', { name: 'Submit' })
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(button)
    
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
