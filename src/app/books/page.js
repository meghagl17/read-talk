"use client";

import styles from './styles.module.css';
import { UserButton, auth, useAuth } from "@clerk/nextjs"
import { useRouter } from 'next/navigation';  // Use next/navigation for app directory routing

import axios from 'axios';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

import { Input } from "../../components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

export default function Home() {
  const router = useRouter(); 

  const { isLoaded, userId } = useAuth();

  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const url = `/api/books`;
      console.log(url);
      const response = await axios.post(url, { query: searchQuery });
      console.log(response.data);
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching recommendations:", error);
    }
  };

  const goToQuestion = async (bookId) => {
    router.push(`/question/${bookId}`);
}

  return (
    <div>
      <div className={styles.searchContainer}>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for books..."
          className={styles.searchInput}
        />
        <button onClick={fetchBooks} className={styles.searchButton}>Search</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.gridContainer}>
          {books.map((book) => (
            <Card key={book.id} className={styles.card}>
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                )}
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>{book.volumeInfo.title}</CardTitle>
                <CardDescription className={styles.cardDescription}><p>by {book.volumeInfo.authors?.join(', ')}</p> </CardDescription>
                {/* <cardDescription>Published: {book.volumeInfo.publishedDate}</cardDescription> */}
              </CardHeader>
              <CardContent className={styles.cardContent}>
                <CardDescription className={styles.cardDescriptions}>Published: {book.volumeInfo.publishedDate}</CardDescription>

              </CardContent>
              <CardFooter className={styles.cardFooter}>
                <Dialog>
                  <DialogTrigger>more info userid:{userId} bookId: {book.id}</DialogTrigger>
                  <DialogContent>
                      {book.volumeInfo.imageLinks?.thumbnail && (
                        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                      )}
                      {book.volumeInfo.title}
                      <p>by {book.volumeInfo.authors?.join(', ')}</p>
                      Published: {book.volumeInfo.publishedDate}
                    <DialogHeader>
                      <DialogTitle>more info!</DialogTitle>
                      <DialogDescription>
                        more information will come soon
                      </DialogDescription>
                      <button onClick={() => goToQuestion(book.id)} type="submit">new Question</button>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}