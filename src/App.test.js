import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { api } from './api/contactsAPI';
import App from './App';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

// Mock API
jest.mock('./api/contactsAPI', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock FontAwesome icons
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => icon
}));

// Mock icons
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faArrowUpAZ: 'up-arrow-icon',
  faArrowDownAZ: 'down-arrow-icon',
  faSearch: 'search-icon',
  faUserPlus: 'user-plus-icon',
  faEdit: 'edit-icon',
  faTrash: 'trash-icon',
  faSave: 'save-icon',
  faRotateRight: 'rotate-icon'
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    this.element = element;
    setTimeout(() => {
      this.callback([{
        isIntersecting: true,
        target: element,
        intersectionRatio: 1
      }]);
    }, 0);
  }

  disconnect() {
    this.element = null;
  }
}

window.IntersectionObserver = MockIntersectionObserver;

describe('PhonebookPage', () => {
  const mockContacts = [
    { 
      id: 1, 
      name: 'Ayam Goreng', 
      phone: '081234567890',
      avatar: 'ayam.jpg',
      status: { sent: true, operation: null }
    },
    { 
      id: 2, 
      name: 'Ayam Bakar', 
      phone: '087654321098',
      status: { sent: true, operation: null }
    }
  ];

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { phonebooks: mockContacts } });
  });

  test('loads and displays contacts from API', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('api/phonebooks', {
        params: {
          limit: 5,
          search: '',
          sortMode: 'ASC',
          sortBy: 'name'
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
      expect(screen.getByText('Ayam Bakar')).toBeInTheDocument();
    });
  });

  test('filters contacts when searching', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    await userEvent.type(searchInput, 'Goreng');

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
      expect(screen.queryByText('Ayam Bakar')).not.toBeInTheDocument();
    });
  });

  test('filters contacts by phone number', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    await userEvent.type(searchInput, '0812');

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
      expect(screen.queryByText('Ayam Bakar')).not.toBeInTheDocument();
    });
  });

  test('toggles sort mode when clicking sort button', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    const sortButton = screen.getByRole('button', { name: 'down-arrow-icon' });
    await userEvent.click(sortButton);

    await waitFor(() => {
      const query = JSON.parse(sessionStorage.getItem('query'));
      expect(query.sortMode).toBe('DESC');
    });
  });

  test('handles contact deletion', async () => {
    api.delete.mockResolvedValueOnce({});
    
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    const ayamGorengContact = screen.getByText('Ayam Goreng').closest('.contact-box');
    const deleteButton = within(ayamGorengContact).getByText('trash-icon');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/apakah anda yakin ingin menghapus/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Ya');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('api/phonebooks/1');
      expect(screen.queryByText('Ayam Goreng')).not.toBeInTheDocument();
    });
  });

  test('handles contact editing', async () => {
    api.put.mockResolvedValueOnce({});
    
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    // Find and click edit button
    const ayamGorengContact = screen.getByText('Ayam Goreng').closest('.contact-box');
    const editButton = within(ayamGorengContact).getByText('edit-icon');
    await userEvent.click(editButton);

    // Edit the contact
    const nameInput = within(ayamGorengContact).getByDisplayValue('Ayam Goreng');
    const phoneInput = within(ayamGorengContact).getByDisplayValue('081234567890');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Ayam Updated');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '9999999999');

    // Save changes
    const saveButton = within(ayamGorengContact).getByText('save-icon');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('api/phonebooks/1', {
        name: 'Ayam Updated',
        phone: '9999999999'
      });
    });
  });

  test('validates contact fields when editing', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    // Start editing
    const ayamGorengContact = screen.getByText('Ayam Goreng').closest('.contact-box');
    const editButton = within(ayamGorengContact).getByText('edit-icon');
    await userEvent.click(editButton);

    // Try to save with empty name
    const nameInput = within(ayamGorengContact).getByDisplayValue('Ayam Goreng');
    await userEvent.clear(nameInput);
    const saveButton = within(ayamGorengContact).getByText('save-icon');
    await userEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Please fill in both name and phone');

    // Try to save with non-numeric phone
    await userEvent.type(nameInput, 'Ayam Goreng');
    const phoneInput = within(ayamGorengContact).getByDisplayValue('081234567890');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, 'abc123');
    await userEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Phone number must contain only numeric characters');
  });

  test('handles failed API operations', async () => {
    api.put.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    // Edit contact
    const ayamGorengContact = screen.getByText('Ayam Goreng').closest('.contact-box');
    const editButton = within(ayamGorengContact).getByText('edit-icon');
    await userEvent.click(editButton);

    const nameInput = within(ayamGorengContact).getByDisplayValue('Ayam Goreng');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Ayam Updated');

    const saveButton = within(ayamGorengContact).getByText('save-icon');
    await userEvent.click(saveButton);

    // Check if failure is handled
    await waitFor(() => {
      const contactText = screen.getByText((content, element) => {
        return element.textContent === 'Ayam Updated (Failed to update)';
      });
      expect(contactText).toBeInTheDocument();
    });

    // Verify retry button appears
    const retryButton = within(ayamGorengContact).getByText('rotate-icon');
    expect(retryButton).toBeInTheDocument();

    // Test retry functionality
    api.put.mockResolvedValueOnce({});
    await userEvent.click(retryButton);

    // Verify success - the status message should be gone
    await waitFor(() => {
      // Find the updated contact box
      const updatedContactBox = screen.getByText('Ayam Updated').closest('.contact-box');
      
      // Check contact name div (should not have error message)
      const nameDiv = within(updatedContactBox).getByText('Ayam Updated');
      expect(nameDiv.textContent.trim()).toBe('Ayam Updated');

      // Check phone number
      expect(within(updatedContactBox).getByText('081234567890')).toBeInTheDocument();

      // The retry button should be gone
      expect(within(updatedContactBox).queryByText('rotate-icon')).not.toBeInTheDocument();
    });
  });

  test('validates phone number format when editing', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    // Edit contact
    const ayamGorengContact = screen.getByText('Ayam Goreng').closest('.contact-box');
    const editButton = within(ayamGorengContact).getByText('edit-icon');
    await userEvent.click(editButton);

    // Try to update with invalid phone number
    const phoneInput = within(ayamGorengContact).getByDisplayValue('081234567890');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, 'abc123');

    const saveButton = within(ayamGorengContact).getByText('save-icon');
    await userEvent.click(saveButton);

    // Check if validation alert is shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Phone number must contain only numeric characters');
    });

    // Contact should still be in edit mode
    expect(within(ayamGorengContact).getByDisplayValue('abc123')).toBeInTheDocument();
  });

  test('handles adding new contact with offline functionality', async () => {
    // Mock a failed API call
    api.post.mockRejectedValueOnce(new Error('Network error'));
    
    const { unmount } = render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('Name');
    const phoneInput = screen.getByPlaceholderText('Phone');
    await userEvent.type(nameInput, 'Ayam Penyet');
    await userEvent.type(phoneInput, '5555555555');

    // Submit the form
    const saveButton = screen.getByText('save');
    await userEvent.click(saveButton);

    // Clean up the AddPage component
    unmount();

    // Mock API response for contacts list
    api.get.mockResolvedValueOnce({ 
      data: { 
        phonebooks: [] 
      } 
    });

    // Should be redirected to home page
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    // Wait for contacts list to appear
    await waitFor(() => {
      expect(screen.getByTestId('contacts-list')).toBeInTheDocument();
    });

    // Verify contact is added with failed status
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      expect(contactBoxes.length).toBeGreaterThan(0);
      
      const firstContact = contactBoxes[0];
      
      // Verify name with failed status
      const nameDiv = within(firstContact).getByText(/Ayam Penyet/);
      expect(nameDiv.textContent).toMatch(/Ayam Penyet.*Failed to add/);
      
      // Verify phone number and retry button
      expect(within(firstContact).getByText('5555555555')).toBeInTheDocument();
      expect(within(firstContact).getByText('rotate-icon')).toBeInTheDocument();
    });

    // Test retry functionality
    // Mock successful post for retry
    api.post.mockResolvedValueOnce({ 
      data: { 
        id: 1,
        name: 'Ayam Penyet',
        phone: '5555555555'
      } 
    });
    
    // Mock the get call that happens after successful retry
    api.get.mockResolvedValueOnce({
      data: {
        phonebooks: [{
          id: 1,
          name: 'Ayam Penyet',
          phone: '5555555555'
        }]
      }
    });
    
    const retryButton = screen.getByText('rotate-icon');
    await userEvent.click(retryButton);

    // Wait for the retry operation to complete
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      expect(contactBoxes.length).toBeGreaterThan(0);
      
      const firstContact = contactBoxes[0];
      const nameDiv = within(firstContact).getByText('Ayam Penyet');
      
      // The text should only contain the name, no failure message
      expect(nameDiv.textContent.trim()).toBe('Ayam Penyet');
      
      // Retry button should be gone
      expect(within(firstContact).queryByText('rotate-icon')).not.toBeInTheDocument();
    }, { timeout: 3000 }); // Increase timeout to allow for API calls
  });

  test('validates empty fields when adding contact', async () => {
    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    // Try to submit empty form
    const saveButton = screen.getByText('save');
    await userEvent.click(saveButton);

    // Check if validation alert is shown
    expect(window.alert).toHaveBeenCalledWith('Please fill in both name and phone');

    // Fill only name
    const nameInput = screen.getByPlaceholderText('Name');
    await userEvent.type(nameInput, 'Ayam Geprek');
    await userEvent.click(saveButton);

    // Check validation again
    expect(window.alert).toHaveBeenCalledWith('Please fill in both name and phone');

    // Fill only phone
    await userEvent.clear(nameInput);
    const phoneInput = screen.getByPlaceholderText('Phone');
    await userEvent.type(phoneInput, '9999999999');
    await userEvent.click(saveButton);

    // Check validation again
    expect(window.alert).toHaveBeenCalledWith('Please fill in both name and phone');
  });

  test('handles successful contact addition', async () => {
    api.post.mockResolvedValueOnce({});
    
    const { unmount } = render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('Name');
    const phoneInput = screen.getByPlaceholderText('Phone');
    await userEvent.type(nameInput, 'Ayam Kalasan');
    await userEvent.type(phoneInput, '1111111111');

    // Submit the form
    const saveButton = screen.getByText('save');
    await userEvent.click(saveButton);

    // Clean up the AddPage component
    unmount();

    // Mock API response for contacts list
    api.get.mockResolvedValueOnce({
      data: {
        phonebooks: [{
          id: 1,
          name: 'Ayam Kalasan',
          phone: '1111111111'
        }]
      }
    });

    // Should be redirected to home page
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    // Wait for contacts list to appear
    await waitFor(() => {
      expect(screen.getByTestId('contacts-list')).toBeInTheDocument();
    });

    // Wait for contacts to load and verify the new contact
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      expect(contactBoxes.length).toBeGreaterThan(0);
      
      const firstContact = contactBoxes[0];
      
      // Verify name
      const nameDiv = within(firstContact).getByText(/Ayam Kalasan/);
      expect(nameDiv.textContent.trim()).toBe('Ayam Kalasan');
      
      // Verify phone number and no retry button
      expect(within(firstContact).getByText('1111111111')).toBeInTheDocument();
      expect(within(firstContact).queryByText('rotate-icon')).not.toBeInTheDocument();
    });
  });

  test('handles offline mode when API fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error('Network error'));

    const offlineContacts = [
      { 
        id: 1, 
        name: 'Ayam Rica Rica', 
        phone: '1111111111', 
        status: { sent: false, operation: 'update' } 
      }
    ];
    sessionStorage.setItem('local_contacts', JSON.stringify(offlineContacts));

    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const contactText = screen.getByText((content, element) => {
        return element.textContent === 'Ayam Rica Rica (Failed to update)';
      });
      expect(contactText).toBeInTheDocument();
    });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test('implements infinite scroll', async () => {
    const manyContacts = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Ayam ${i + 1}`,
      phone: `123456789${i}`,
      status: { sent: true, operation: null }
    }));

    api.get.mockResolvedValueOnce({ data: { phonebooks: manyContacts.slice(0, 5) } });
    api.get.mockResolvedValueOnce({ data: { phonebooks: manyContacts } });

    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam 1')).toBeInTheDocument();
    });

    expect(JSON.parse(sessionStorage.getItem('query')).limit).toBe(5);

    await waitFor(() => {
      const query = JSON.parse(sessionStorage.getItem('query'));
      expect(query.limit).toBe(10);
    });

    expect(api.get).toHaveBeenCalledWith('api/phonebooks', {
      params: expect.objectContaining({ limit: 10 })
    });
  });

  test('handles avatar navigation', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
    });

    const ayamGorengContact = screen.getByText('Ayam Goreng').closest('.contact-box');
    const avatar = within(ayamGorengContact).getByAltText('Avatar');
    await userEvent.click(avatar);

    // Check if avatar path is stored in session storage
    expect(sessionStorage.getItem('currentAvatar')).toBe('http://192.168.1.20:3000/images/ayam.jpg');
    expect(window.location.pathname).toBe('/avatar/1');
  });

  test('navigates to add page', async () => {
    render(
      <BrowserRouter>
        <PhonebookPage />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: 'user-plus-icon' });
    await userEvent.click(addButton);

    expect(window.location.pathname).toBe('/add');
  });
});

describe('AddPage Form Validation and Error Handling', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('validates empty form fields', async () => {
    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    const saveButton = screen.getByText('save');
    await userEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Please fill in both name and phone');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('validates phone number format', async () => {
    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Name');
    const phoneInput = screen.getByPlaceholderText('Phone');
    const saveButton = screen.getByText('save');

    // Test with invalid phone number (letters)
    await userEvent.type(nameInput, 'Ayam Penyet');
    await userEvent.type(phoneInput, 'abc123');
    await userEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Please enter a valid phone number');
    expect(api.post).not.toHaveBeenCalled();

    // Test with valid phone number
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '081234567890');
    await userEvent.click(saveButton);

    expect(api.post).toHaveBeenCalledWith('api/phonebooks', {
      name: 'Ayam Penyet',
      phone: '081234567890'
    });
  });

  test('handles network timeout for new contact', async () => {
    // Mock network timeout
    api.post.mockRejectedValueOnce(new Error('Network timeout'));

    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Name');
    const phoneInput = screen.getByPlaceholderText('Phone');
    const saveButton = screen.getByText('save');

    await userEvent.type(nameInput, 'Ayam Geprek');
    await userEvent.type(phoneInput, '087812345678');
    await userEvent.click(saveButton);

    // Wait for the local storage to be updated
    await waitFor(() => {
      const localContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
      expect(localContacts.length).toBeGreaterThan(0);
    });

    // Now check the stored contact
    const localContacts = JSON.parse(sessionStorage.getItem('local_contacts'));
    expect(localContacts[0].name).toBe('Ayam Geprek');
    expect(localContacts[0].phone).toBe('087812345678');
    expect(localContacts[0].status.sent).toBe(false);
    expect(localContacts[0].status.operation).toBe('add');
  });

  test('handles offline functionality for multiple contacts', async () => {
    // Mock network failure
    api.post.mockRejectedValue(new Error('Network error'));

    // Mock window.location to prevent actual navigation
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/' };

    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    // Add first contact
    await userEvent.type(screen.getByPlaceholderText('Name'), 'Ayam Kalasan');
    await userEvent.type(screen.getByPlaceholderText('Phone'), '089876543210');
    await userEvent.click(screen.getByText('save'));

    // Wait for the first contact to be saved
    await waitFor(() => {
      const contacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
      expect(contacts.length).toBe(1);
    });

    // Clear inputs and add second contact
    const nameInput = screen.getByPlaceholderText('Name');
    const phoneInput = screen.getByPlaceholderText('Phone');
    
    await userEvent.clear(nameInput);
    await userEvent.clear(phoneInput);
    await userEvent.type(nameInput, 'Ayam Rica Rica');
    await userEvent.type(phoneInput, '082198765432');
    await userEvent.click(screen.getByText('save'));

    // Wait for both contacts to be stored
    await waitFor(() => {
      const contacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
      expect(contacts.length).toBe(2);
    });

    // Verify both contacts are stored locally
    const localContacts = JSON.parse(sessionStorage.getItem('local_contacts'));
    expect(localContacts).toHaveLength(2);
    expect(localContacts[0].name).toBe('Ayam Rica Rica');
    expect(localContacts[1].name).toBe('Ayam Kalasan');
    expect(localContacts.every(contact => !contact.status.sent)).toBe(true);

    // Restore window.location
    window.location = originalLocation;
  });

  test('cancel button navigates back to home without saving', async () => {
    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    // Type some data
    await userEvent.type(screen.getByPlaceholderText('Name'), 'Ayam Betutu');
    await userEvent.type(screen.getByPlaceholderText('Phone'), '081111222333');

    // Click cancel
    const cancelButton = screen.getByText('cancel');
    await userEvent.click(cancelButton);

    // Verify navigation occurred
    expect(window.location.pathname).toBe('/');
    
    // Verify no data was saved
    expect(api.post).not.toHaveBeenCalled();
    const localContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
    expect(localContacts).toHaveLength(0);
  });

  test('handles whitespace in input fields', async () => {
    render(
      <BrowserRouter>
        <AddPage />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Name'), '  Ayam Taliwang  ');
    await userEvent.type(screen.getByPlaceholderText('Phone'), '  085555666777  ');
    await userEvent.click(screen.getByText('save'));

    expect(api.post).toHaveBeenCalledWith('api/phonebooks', {
      name: 'Ayam Taliwang',
      phone: '085555666777'
    });
  });
});
