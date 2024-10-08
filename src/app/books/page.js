"use client";

import styles from './styles.module.css';
import React, { useCallback } from 'react';
import { UserButton, auth, useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from 'next/navigation';  // Use next/navigation for app directory routing

import axios from 'axios';
import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

import { Input } from "../../components/ui/input"

import Spinner from '../../components/loadingUi.jsx'
import { LibraryBig } from 'lucide-react';
import { CirclePlus } from 'lucide-react';


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

import { Anton } from 'next/font/google'

const pacifico = Anton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function Home() {
  const router = useRouter(); 

  const { isLoaded, userId } = useAuth();

  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingDialog, setLoadingDialog] = useState(false);

  const fetchInitialBooks = async () => {
    try {
      const response = await fetch('/api/books');
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error("Error fetching Books:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchInitialBooks();
  }, [userId, isLoaded]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const url = `/api/books`;
      const response = await axios.post(url, { query: searchQuery });
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchQuestions = async (BookId) => {
    const res = await fetch(`/api/questions?BookId=${BookId}`);
    const data = await res.json();
  
    if (!res.ok) {
      setLoadingDialog(false);
      throw new Error(data.message || 'Something went wrong');
    }

    setQuestions(data.data);
    setLoadingDialog(false);
    // return data;
  };

  const goToQuestion = async (bookId) => {
    // setQuestions([]);
    router.push(`/question/${bookId}`);
  }

  const searchParams = useSearchParams()
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
 
      return params.toString()
    },
    [searchParams]
  )

  const goToAnswer = async (bookId, questionId) => {
    router.push(`/answers/${bookId}/?` + createQueryString('questionId', questionId))
  }

  const [openDialog, setOpenDialog] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  const handleDialogOpen = (book) => {
    setLoadingDialog(true);
    setCurrentBook(book);
    setOpenDialog(true);
    fetchQuestions(book.id);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setQuestions([]); // Clear questions when dialog closes
    setCurrentBook(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r mt-4">
      {/* Search Bar */}
      <div className="flex justify-center items-center mb-8">
        <div className="relative w-full max-w-md px-4">
          {/* Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books..."
            className="w-full px-4 py-2 rounded-l-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder:text-gray-500 placeholder:text-sm placeholder:font-medium text-sm font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                // e.preventDefault();
                fetchBooks();
              }
            }}
          />
  
          {/* Search Button */}
          <button
            onClick={fetchBooks}
            className={`${pacifico.className} flex items-center justify-center absolute right-0 top-0 h-full px-4 py-2 rounded-r-lg text-[#3b4a73] font-medium focus:outline-none focus:ring-2 focus:ring-[#c6e5f3] transition-colors duration-300 space-x-2`}
            style={{ backgroundColor: '#c6e5f3' }}
          >
            <span>Search</span>
            <LibraryBig className="w-5 h-5" /> 
          </button>
        </div>
      </div>
  
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 max-w-4xl">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex flex-col items-center text-center border border-gray-300 rounded-lg p-3 bg-white shadow-md transition-transform transform hover:scale-105 max-w-xs"
              >
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                    className="w-28 h-40 object-cover mb-3" // Adjusted size for smaller images
                  />
                )}
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-gray-800" style={{ color: '#2a3a5a' }}>
                    {book.volumeInfo.title}
                  </h2>
                  <p className="text-gray-600 text-sm">by {book.volumeInfo.authors?.join(', ')}</p>
                </div>
                <p className="text-gray-500 text-sm mb-3">Published: {book.volumeInfo.publishedDate}</p>
                <button
                  onClick={() => handleDialogOpen(book)}
                  className={`${pacifico.className} text-lg font-medium text-[#3b4a73] px-3 py-1 rounded transition`}
                  style={{ backgroundColor: '#c6e5f3' }}
                >
                  More Info
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
  
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) handleDialogClose();
        }}
      >
        {!loadingDialog ? (
  <DialogContent className="p-2 bg-white rounded-lg shadow-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
    <div className="flex flex-col items-center">
      {currentBook?.volumeInfo.imageLinks?.thumbnail && (
        <img
          src={currentBook.volumeInfo.imageLinks.thumbnail}
          alt={currentBook.volumeInfo.title}
          className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 object-cover rounded-lg mb-4"
        />
      )}
      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800 mb-1 text-center" style={{ color: '#2a3a5a' }}>
        {currentBook?.volumeInfo.title}
      </h2>
      <p className="text-sm sm:text-md md:text-lg font-medium text-gray-600 mb-2">
        by {currentBook?.volumeInfo.authors?.join(', ')}
      </p>
      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 mb-0">
        Published: {currentBook?.volumeInfo.publishedDate}
      </p>
    </div>

    <div className="mt-4 max-h-40 overflow-y-auto">
      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question._id} className="flex gap-4 bg-white px-4 py-3 justify-between mb-2 shadow-sm">
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-xs sm:text-sm md:text-base font-medium leading-normal text-[#2a3a5a]">
                {question.question}
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={() => goToAnswer(currentBook?.id, question._id)}
                className="text-[#181411] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="flex gap-4 bg-white px-4 py-3 justify-between mb-2 shadow-sm">
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-xs sm:text-sm md:text-base font-medium leading-normal text-center">
              Be the first one to post a discussion question!
            </p>
          </div>
        </div>
      )}
    </div>

    <div className="flex items-center justify-center py-3">
      <button
        onClick={() => goToQuestion(currentBook?.id)}
        className={`${pacifico.className} flex items-center justify-center min-w-[90px] max-w-[280px] sm:max-w-[320px] md:max-w-[480px] cursor-pointer overflow-hidden rounded-xl h-10 sm:h-12 px-10 sm:px-14 md:px-20 text-xs sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#a1c9e7] transition`}
        style={{ backgroundColor: '#c6e5f3', color: '#3b4a73' }}
      >
        <span className="flex items-center justify-center">
          <span className="text-base sm:text-lg md:text-2xl font-medium truncate">Post New Question</span>
          <CirclePlus className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjust size if needed */}
        </span>
      </button>
    </div>
  </DialogContent>

        ) : (
          <DialogTitle className="text-xl font-semibold text-gray-800">Loading...</DialogTitle>
        )}
      </Dialog>
    </div>
  );  
}