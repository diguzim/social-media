export function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>User Portal</h1>
      <p>Welcome to the user portal. Build your features here.</p>
      <div style={{ marginTop: '20px' }}>
        <a
          href="/register"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Register
        </a>
      </div>
    </div>
  );
}
