import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'var(--clr-light)',
      backgroundImage: 'radial-gradient(circle at 10% 80%, var(--clr-primary-lt) 0%, transparent 20%), radial-gradient(circle at 90% 10%, #fff0b3 0%, transparent 25%)',
      padding: 'var(--sp-4)'
    }}>
      <div className="auth-card-wrapper" style={{ animation: 'fadeIn var(--ease-mid)' }}>
        <SignUp 
          path="/sign-up" 
          appearance={{
            variables: {
              colorPrimary: '#1a2a4b', 
              colorText: '#0D1B2A',   
              colorBackground: '#ffffff',
              borderRadius: '12px',
              fontFamily: 'var(--font-body)',
            },
            elements: {
              card: {
                boxShadow: '0 20px 48px rgba(0,0,0,0.08)',
                border: '1px solid var(--clr-border)',
                padding: '2rem',
              },
              headerTitle: {
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--clr-navy)',
                letterSpacing: '-0.01em',
              },
              formButtonPrimary: {
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '700',
                textTransform: 'none',
                background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)',
              }
            }
          }}
        />
      </div>
    </div>
  );
}
