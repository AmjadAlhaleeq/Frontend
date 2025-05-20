import React, { useState } from 'react';
import { useReservation } from '@/context/ReservationContext';

const AddPitch = () => {
  const { addPitch } = useReservation();
  
  const [pitchData, setPitchData] = useState({
    name: '',
    location: '',
    imageUrl: '',
    description: '',
    price: 0,
    amenities: [''],
    playersPerSide: 5,
    features: ['indoor'],
    galleryImages: []
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPitch({
      ...pitchData,
      availability: 'Available',
      hours: '8:00 AM - 10:00 PM',
      capacity: `${pitchData.playersPerSide * 2}`,
      image: pitchData.imageUrl, // Set image from imageUrl for compatibility
    });
    
    // Reset form
    setPitchData({
      name: '',
      location: '',
      imageUrl: '',
      description: '',
      price: 0,
      amenities: [''],
      playersPerSide: 5,
      features: ['indoor'],
      galleryImages: []
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPitchData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPitchData(prevData => ({
      ...prevData,
      [name]: parseInt(value) || 0
    }));
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Pitch</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Pitch Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={pitchData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
            Location:
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={pitchData.location}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">
            Image URL:
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={pitchData.imageUrl}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={pitchData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
            Price:
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={pitchData.price}
            onChange={handleNumberChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="playersPerSide" className="block text-gray-700 text-sm font-bold mb-2">
            Players per side:
          </label>
          <input
            type="number"
            id="playersPerSide"
            name="playersPerSide"
            value={pitchData.playersPerSide}
            onChange={handleNumberChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <button type="submit" className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Add Pitch
        </button>
      </form>
    </div>
  );
};

export default AddPitch;
