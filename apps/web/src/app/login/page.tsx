'use client';

import { FormEvent, useState } from 'react';
import { login } from '@/features/auth/api/login';
import { ApiError } from '@/lib/api.client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage('');

    try {
      const response = await login({
        email,
        password,
      });
      
      const { role } = response.data;

      if (!response.success){
        throw new Error("what the fuck")
      }
      setMessage('Login successful.');  
      
      if (
            role === 'admin' ||
            role === 'hr'
      ) {
        router.replace('/dashboard');
      } else {
        router.replace('/employee/dashboard');
      }

    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      } else {
        setMessage('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full border p-2"
          />
        </div>

        <div>
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="w-full border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="border px-4 py-2"
        >
          {isLoading
            ? 'Signing in...'
            : 'Sign in'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}