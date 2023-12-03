import { createContext, useCallback, useContext, useEffect, useReducer } from "react";

const CitiesContext = createContext()
const BASE_URL = 'http://localhost:8000'

// refactoring the state management by coalescing the useState calls into a single useReducer call
const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: '',
}

// below in the switch statement there's no need for a break since we used the return keyword, otherwise we would have used it

// keynote: in this project we are passing the dispatch funtions into the our event handlers (deleteCity, createCity etc) which are passed to the components through the context api, this is one way to go about it. or we could pass the dispatch functions into the components themselves and create the event handlers inside of those component, that would mean that the context api would be passing the dispatch functions rather than the event handlers... capisce??

function reducer(state, action) {
  switch (action.type) {
    case 'loading': 
      return {
        ...state,
        isLoading: true,
      }

    case 'cities/loaded':
      return {
        ...state,
        isLoading: false,
        cities: action.payload
      }
    
      case 'city/loaded':
        return {
          ...state,
          isLoading: false,
          currentCity: action.payload
        }
      
    case 'city/created':
      return {
        ...state, 
        isLoading: false, 
        cities: [...state.cities, action.payload],
        currentCity: action.payload,  
      }

    case 'city/deleted':
      return {
        ...state, 
        isLoading: false, 
        cities: state.cities.filter((city) => city.id !== action.payload)
      }

    case 'rejected': 
      return {
      ...state,
      isLoading: false,
      error: action.payload
      }

    default: throw new Error('Unkown action type')
  }
}

// eslint-disable-next-line react/prop-types
function CitiesProvider({ children }) {
  const [{cities, isLoading, currentCity, error}, dispatch] = useReducer(reducer, initialState)

  useEffect(function() {
    async function fetchCities() {
      dispatch({type: 'loading'});

      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data =  await res.json();
        dispatch({type: 'cities/loaded', payload: data});
      } catch {
        dispatch({type: 'rejected', payload: 'there was an error loading the cities...'})
      }
  }
  fetchCities();
  }, []);

  const getCity = useCallback(async function getCity(id) {
    if(Number(id) ===  currentCity.id) return;

    dispatch({type: 'loading'});

      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data =  await res.json();
        dispatch({type: 'city/loaded', payload: data});
    } catch {
      dispatch({type: 'rejected', payload: 'there was an error loading the city...'})
    } 
  }, [currentCity.id])

  async function createCity(newCity ) {
    dispatch({type: 'loading'});

    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          'content-type': 'application/json',
        }
      });
      const data =  await res.json();

      dispatch({type: 'city/created', payload: data})
    } catch {
      dispatch({type: 'rejected', payload: 'there was an error creating the city...'})
    }
  }

  async function deleteCity(id) {
    dispatch({type: 'loading'});
  
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: 'DELETE',
      });

      dispatch({type: 'city/deleted', payload: id})
    } catch {
      dispatch({type: 'rejected', payload: 'there was an error deleting the city...'})
    }

  }

  return (
    <CitiesContext.Provider value={
      {
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }
    }>
      {children}
    </CitiesContext.Provider>
  )

}

function useCities() {
  const context = useContext(CitiesContext)
  if(context === undefined) throw new Error('CitiesContext does not exist outside CitiesProvider')
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export {CitiesProvider, useCities};