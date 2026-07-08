import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ROUTES } from '@/app/router/routes'

// Route-level code splitting: Monaco (pulled in by the editor) and each feature
// surface load on demand, keeping the initial app-shell bundle small.
const EditorPage = lazy(() =>
  import('@/pages/EditorPage').then((m) => ({ default: m.EditorPage })),
)
const DiffPage = lazy(() =>
  import('@/pages/DiffPage').then((m) => ({ default: m.DiffPage })),
)
const QueryPage = lazy(() =>
  import('@/pages/QueryPage').then((m) => ({ default: m.QueryPage })),
)
const RequestPage = lazy(() =>
  import('@/pages/RequestPage').then((m) => ({ default: m.RequestPage })),
)
const MarkdownPage = lazy(() =>
  import('@/pages/MarkdownPage').then((m) => ({ default: m.MarkdownPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.editor} replace /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'editor/:documentId', element: <EditorPage /> },
      { path: 'diff', element: <DiffPage /> },
      { path: 'query', element: <QueryPage /> },
      { path: 'request', element: <RequestPage /> },
      { path: 'markdown', element: <MarkdownPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
