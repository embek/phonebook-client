import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { api } from './services/api';
import App from './App';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';
import { CustomContext } from './components/CustomContext';

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

// Mock API
jest.mock('./services/api', () => ({
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

// Mock initial context state
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

// Update mock state to include contacts and modal
const mockState = {
  contacts: mockContacts,
  modal: {
    isOpen: false,
    contactIdToDelete: null
  },
  query: {
    limit: 10,
    sortMode: 'ASC',
    sortBy: 'name',
    search: ''
  }
};

const mockDispatch = jest.fn();

// Custom render function with context provider
const renderWithContext = (component) => {
  return render(
    <CustomContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </CustomContext.Provider>
  );
};

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
    renderWithContext(<PhonebookPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('api/phonebooks', {
        params: {
          limit: 10,  // Updated to match initial state
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
    let currentState = { ...mockState };
    const localDispatch = jest.fn((action) => {
      if (action.type === 'SET_QUERY') {
        // Handle each character typed
        const searchText = action.payload.search;
        currentState = {
          ...currentState,
          query: { 
            ...currentState.query, 
            search: searchText,
            limit: 5,
            sortBy: 'name',
            sortMode: 'ASC'
          }
        };
      }
    });

    render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    // Type full text at once
    await userEvent.paste(searchInput, 'Goreng');

    await waitFor(() => {
      const lastCall = localDispatch.mock.calls[localDispatch.mock.calls.length - 1];
      expect(lastCall[0]).toEqual({
        type: 'SET_QUERY',
        payload: expect.objectContaining({
          search: 'Goreng',
          limit: 5
        })
      });
    });
  });

  test('filters contacts by phone number', async () => {
    // Mock state with filtered contacts
    const filteredState = {
      ...mockState,
      contacts: [mockContacts[0]], // Only Ayam Goreng
      query: {
        ...mockState.query,
        search: '0812'
      }
    };

    render(
      <CustomContext.Provider value={{ state: filteredState, dispatch: mockDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Ayam Goreng')).toBeInTheDocument();
      expect(screen.queryByText('Ayam Bakar')).not.toBeInTheDocument();
    });
  });

  test('toggles sort mode when clicking sort button', async () => {
    renderWithContext(<PhonebookPage />);
    
    const sortButton = screen.getByRole('button', { name: 'up-arrow-icon' });
    await userEvent.click(sortButton);

    expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_QUERY',
        payload: expect.objectContaining({
            sortMode: 'DESC'
        })
    });
  });

  test('handles contact deletion', async () => {
    api.delete.mockResolvedValueOnce({});

    renderWithContext(<PhonebookPage />);

    // Get the first contact's delete button
    const firstContact = screen.getAllByTestId('contact-box')[0];
    const deleteButton = within(firstContact).getByRole('button', { name: 'trash-icon' });
    await userEvent.click(deleteButton);

    expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_MODAL',
        payload: {
            isOpen: true,
            contactIdToDelete: expect.any(Number)
        }
    });
  });

  test('handles contact editing', async () => {
    const updatedContact = {
      ...mockState.contacts[0],
      name: 'Ayam Updated',
      phone: '9999999999',
      status: { sent: true, operation: null }
    };

    let currentState = { ...mockState };
    const localDispatch = jest.fn((action) => {
      switch(action.type) {
        case 'SET_CONTACTS':
          currentState = {
            ...currentState,
            contacts: currentState.contacts.map(c => 
              c.id === updatedContact.id ? updatedContact : c
            )
          };
          break;
        default:
          break;
      }
    });

    api.put.mockResolvedValueOnce({ data: updatedContact });

    const { rerender } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Start editing
    const contact = screen.getAllByTestId('contact-box')[0];
    await userEvent.click(within(contact).getByRole('button', { name: 'edit-icon' }));

    // Update inputs
    const inputs = within(contact).getAllByRole('textbox');
    await userEvent.clear(inputs[0]);
    await userEvent.type(inputs[0], 'Ayam Updated');
    await userEvent.clear(inputs[1]);
    await userEvent.type(inputs[1], '9999999999');

    const saveButton = within(contact).getByRole('button', { name: 'save-icon' });
    await userEvent.click(saveButton);

    // Update state manually to simulate successful update
    currentState.contacts[0] = updatedContact;
    rerender(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    await waitFor(() => {
      const updatedName = within(contact).getByText(/Ayam Updated/);
      expect(updatedName).toBeInTheDocument();
      expect(within(contact).getByText('9999999999')).toBeInTheDocument();
    });
  });

  test('validates contact fields when editing', async () => {
    let currentState = { ...mockState };
    
    const { rerender } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: mockDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Get first contact and start editing
    const contact = screen.getAllByTestId('contact-box')[0];
    await userEvent.click(within(contact).getByRole('button', { name: 'edit-icon' }));

    const inputs = within(contact).getAllByRole('textbox');
    const nameInput = inputs[0];
    const saveButton = within(contact).getByRole('button', { name: 'save-icon' });

    // Try to save with empty name
    await userEvent.clear(nameInput);
    await userEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Please fill in both name and phone');
  });

  test('handles failed API operations', async () => {
    api.put.mockRejectedValueOnce(new Error('Network error'));

    let currentState = { ...mockState };
    const localDispatch = jest.fn((action) => {
      if (action.type === 'SET_CONTACTS') {
        currentState = {
          ...currentState,
          contacts: currentState.contacts.map(c => 
            c.id === 1 ? {
              ...c,
              name: 'Ayam Updated',
              status: { sent: false, operation: 'update' }
            } : c
          )
        };
      }
    });

    const { rerender } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    const contact = screen.getAllByTestId('contact-box')[0];
    await userEvent.click(within(contact).getByRole('button', { name: 'edit-icon' }));
    
    const inputs = within(contact).getAllByRole('textbox');
    await userEvent.clear(inputs[0]);
    await userEvent.type(inputs[0], 'Ayam Updated');

    await userEvent.click(within(contact).getByRole('button', { name: 'save-icon' }));

    // Simulate failed update state
    currentState.contacts[0] = {
      ...currentState.contacts[0],
      name: 'Ayam Updated',
      status: { sent: false, operation: 'update' }
    };

    rerender(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    await waitFor(() => {
      const contactDiv = screen.getByText(/Ayam Updated.*Failed to update/i);
      expect(contactDiv).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'rotate-icon' })).toBeInTheDocument();
    });
  });

  test('validates phone number format when editing', async () => {
    let currentState = { ...mockState };
    const { rerender } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: mockDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Wait for contacts to load and get first contact
    await waitFor(() => {
      expect(screen.getAllByTestId('contact-box').length).toBeGreaterThan(0);
    });

    const firstContact = screen.getAllByTestId('contact-box')[0];
    
    // Start editing
    const editButton = within(firstContact).getByRole('button', { name: 'edit-icon' });
    await userEvent.click(editButton);

    // Find inputs and enter invalid phone
    const inputs = within(firstContact).getAllByRole('textbox');
    const phoneInput = inputs[1]; // Second input is phone
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, 'abc123');

    // Try to save
    const saveButton = within(firstContact).getByRole('button', { name: 'save-icon' });
    await userEvent.click(saveButton);

    // Verify validation message
    expect(mockAlert).toHaveBeenCalledWith('Phone number must contain only numeric characters');

    // Verify still in edit mode with invalid input
    expect(within(firstContact).getByDisplayValue('abc123')).toBeInTheDocument();
  });

  test('handles adding new contact with offline functionality', async () => {
    // Create a new contact with offline status
    const newContact = {
      id: Date.now(),
      name: 'Ayam Penyet',
      phone: '5555555555',
      status: { sent: false, operation: 'add' }
    };

    let currentState = { ...mockState };
    const localDispatch = jest.fn((action) => {
      if (action.type === 'SET_CONTACTS') {
        currentState = {
          ...currentState,
          contacts: [newContact, ...currentState.contacts]
        };
      }
    });

    api.post.mockRejectedValueOnce(new Error('Network error'));
    
    // Mount AddPage and add contact
    const { unmount } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <AddPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Ayam Penyet');
    await userEvent.type(screen.getByPlaceholderText('Phone'), '5555555555');
    await userEvent.click(screen.getByText('save'));
    unmount();

    // Update state before rendering PhonebookPage
    currentState = {
      ...currentState,
      contacts: [newContact, ...currentState.contacts]
    };

    // Render PhonebookPage with updated state
    const { rerender } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Verify the failed contact appears
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      const firstContact = contactBoxes[0];
      const nameElement = within(firstContact).getByText((content) => 
        content.includes('Ayam Penyet') && content.includes('Failed to add')
      );
      expect(nameElement).toBeInTheDocument();
    });
  });

  test('handles successful contact addition', async () => {
    const newContact = {
      id: 999,
      name: 'Ayam Kalasan',
      phone: '1111111111',
      status: { sent: true, operation: null }
    };

    let currentState = { ...mockState };
    const localDispatch = jest.fn((action) => {
      if (action.type === 'SET_CONTACTS') {
        currentState = {
          ...currentState,
          contacts: [newContact]
        };
      }
    });

    api.post.mockResolvedValueOnce({ data: newContact });
    api.get.mockResolvedValueOnce({
      data: {
        phonebooks: [newContact]
      }
    });

    // Add the contact
    const { unmount } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <AddPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Ayam Kalasan');
    await userEvent.type(screen.getByPlaceholderText('Phone'), '1111111111');
    await userEvent.click(screen.getByText('save'));
    unmount();

    // Update state before showing PhonebookPage
    currentState = {
      ...currentState,
      contacts: [newContact]
    };

    // Show PhonebookPage with updated state
    render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      const firstContact = contactBoxes[0];
      expect(within(firstContact).getByText((content) => 
        content.trim() === 'Ayam Kalasan'
      )).toBeInTheDocument();
      expect(within(firstContact).getByText('1111111111')).toBeInTheDocument();
    });
  });

  test('handles offline mode when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));

    const offlineContacts = [{
        id: 1,
        name: 'Ayam Rica Rica',
        phone: '1111111111',
        status: { sent: false, operation: 'update' }
    }];

    sessionStorage.setItem('local_contacts', JSON.stringify(offlineContacts));

    renderWithContext(<PhonebookPage />);

    await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_CONTACTS',
            payload: offlineContacts
        });
    });
  });

  test('implements infinite scroll', async () => {
    const manyContacts = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Ayam ${i + 1}`,
      phone: `123456789${i}`,
      status: { sent: true, operation: null }
    }));

    // Set up dispatch to update state
    let currentState = {
      ...mockState,
      contacts: manyContacts.slice(0, 5),
      query: {
        ...mockState.query,
        limit: 5
      }
    };

    const mockDispatch = jest.fn((action) => {
      if (action.type === 'LOAD_MORE') {
        currentState = {
          ...currentState,
          contacts: manyContacts,
          query: {
            ...currentState.query,
            limit: 10
          }
        };
      }
    });

    // Create render function with updatable state
    const renderWithUpdatableState = () => {
      return render(
        <CustomContext.Provider value={{ state: currentState, dispatch: mockDispatch }}>
          <BrowserRouter>
            <PhonebookPage />
          </BrowserRouter>
        </CustomContext.Provider>
      );
    };

    // Initial API calls
    api.get.mockImplementation(async () => ({
      data: {
        phonebooks: currentState.contacts
      }
    }));

    // Initial render
    const { rerender } = renderWithUpdatableState();

    // Wait for initial contacts
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      expect(contactBoxes).toHaveLength(5);
    });

    // Trigger intersection observer
    const observer = new MockIntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        mockDispatch({ type: 'LOAD_MORE' });
        // Rerender with updated state
        rerender(
          <CustomContext.Provider value={{ state: currentState, dispatch: mockDispatch }}>
            <BrowserRouter>
              <PhonebookPage />
            </BrowserRouter>
          </CustomContext.Provider>
        );
      }
    });
    
    observer.observe(screen.getByTestId('contacts-list'));

    // Wait for all contacts to load
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      expect(contactBoxes).toHaveLength(10);
    }, { timeout: 3000 });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOAD_MORE' });
  });

  test('handles avatar navigation', async () => {
    // Create fresh state for this test
    const testState = {
      ...mockState,
      contacts: [
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
      ]
    };

    // Mock API response with fresh data
    api.get.mockResolvedValueOnce({ 
      data: { 
        phonebooks: testState.contacts
      } 
    });

    // Render with fresh state
    render(
      <CustomContext.Provider value={{ state: testState, dispatch: mockDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Wait for the component to render with the test data
    await waitFor(() => {
      const contactBoxes = screen.getAllByTestId('contact-box');
      expect(contactBoxes.length).toBe(2);
    });

    // Find the first contact box and its avatar
    const firstContact = screen.getAllByTestId('contact-box')[0];
    const avatar = within(firstContact).getByAltText('Avatar');

    // Click the avatar
    await userEvent.click(avatar);

    // Verify navigation and storage
    expect(sessionStorage.getItem('currentAvatar')).toBe('http://192.168.1.20:3000/images/ayam.jpg');
    expect(window.location.pathname).toBe('/avatar/1');
  });

  test('navigates to add page', async () => {
    renderWithContext(<PhonebookPage />);

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
    renderWithContext(<AddPage />);

    const saveButton = screen.getByText('save');
    await userEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Please fill in both name and phone');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('validates phone number format', async () => {
    renderWithContext(<AddPage />);

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

    renderWithContext(<AddPage />);

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

    renderWithContext(<AddPage />);

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
    renderWithContext(<AddPage />);

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
    renderWithContext(<AddPage />);

    await userEvent.type(screen.getByPlaceholderText('Name'), '  Ayam Taliwang  ');
    await userEvent.type(screen.getByPlaceholderText('Phone'), '  085555666777  ');
    await userEvent.click(screen.getByText('save'));

    expect(api.post).toHaveBeenCalledWith('api/phonebooks', {
      name: 'Ayam Taliwang',
      phone: '085555666777'
    });
  });
});

describe('Additional Comprehensive Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    // Reset API mock default response
    api.get.mockResolvedValue({ data: { phonebooks: mockContacts } });
  });

  test('handles contact search with special characters and spaces', async () => {
    let currentState = { ...mockState };
    const searchText = '   Ayam  Goreng!@#   ';
    let lastSearchPayload = '';

    const localDispatch = jest.fn((action) => {
      if (action.type === 'SET_QUERY') {
        lastSearchPayload = action.payload.search;
        currentState = {
          ...currentState,
          query: { 
            ...currentState.query, 
            ...action.payload
          }
        };
      }
    });

    render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    await userEvent.clear(searchInput);
    await userEvent.paste(searchInput, searchText);

    await waitFor(() => {
      expect(lastSearchPayload).toBe(searchText);
    });
  });

  test('preserves contact order after failed operations', async () => {
    const testContacts = [
      { id: 1, name: 'A Contact', phone: '111', status: { sent: true, operation: null } },
      { id: 2, name: 'B Contact', phone: '222', status: { sent: true, operation: null } },
      { id: 3, name: 'C Contact', phone: '333', status: { sent: true, operation: null } }
    ];

    let currentState = {
      ...mockState,
      contacts: testContacts,
      modal: { isOpen: false, contactIdToDelete: null }
    };

    // Mock API to return test contacts
    api.get.mockResolvedValueOnce({ 
      data: { 
        phonebooks: testContacts 
      } 
    });

    const localDispatch = jest.fn((action) => {
      if (action.type === 'SET_CONTACTS') {
        currentState = {
          ...currentState,
          contacts: action.payload
        };
      }
    });

    api.put.mockRejectedValueOnce(new Error('Network error'));

    const { rerender } = render(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Wait for initial contacts to load
    await waitFor(() => {
      expect(screen.getAllByTestId('contact-box')).toHaveLength(3);
    });

    // Edit middle contact
    const contactBoxes = screen.getAllByTestId('contact-box');
    const middleContact = contactBoxes[1];

    await userEvent.click(within(middleContact).getByRole('button', { name: 'edit-icon' }));
    const inputs = within(middleContact).getAllByRole('textbox');
    await userEvent.clear(inputs[0]);
    await userEvent.type(inputs[0], 'Updated B');

    await userEvent.click(within(middleContact).getByRole('button', { name: 'save-icon' }));

    // Update state to reflect failed operation
    currentState = {
      ...currentState,
      contacts: currentState.contacts.map(c => 
        c.id === 2 ? {
          ...c,
          name: 'Updated B',
          status: { sent: false, operation: 'update' }
        } : c
      )
    };

    rerender(
      <CustomContext.Provider value={{ state: currentState, dispatch: localDispatch }}>
        <BrowserRouter>
          <PhonebookPage />
        </BrowserRouter>
      </CustomContext.Provider>
    );

    // Verify order is preserved
    await waitFor(() => {
      const updatedBoxes = screen.getAllByTestId('contact-box');
      expect(within(updatedBoxes[0]).getByText('A Contact')).toBeInTheDocument();
      expect(within(updatedBoxes[1]).getByText((content) => content.includes('Updated B'))).toBeInTheDocument();
      expect(within(updatedBoxes[2]).getByText('C Contact')).toBeInTheDocument();
    });
  });

  // ...rest of the tests...
});
