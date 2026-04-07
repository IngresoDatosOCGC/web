import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'var(--clr-light)',
      backgroundImage: 'radial-gradient(circle at 20% 20%, var(--clr-primary-lt) 0%, transparent 25%), radial-gradient(circle at 80% 80%, #d0ebff 0%, transparent 25%)',
      padding: 'var(--sp-4)'
    }}>
      <div className="auth-card-wrapper" style={{ animation: 'fadeIn var(--ease-mid)' }}>
        <SignIn 
          path="/sign-in" 
          appearance={{
            variables: {
              colorPrimary: '#1a2a4b', // clr-navy
              colorText: '#0D1B2A',   // clr-navy-mid
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
              headerSubtitle: {
                color: 'var(--clr-text-muted)',
              },
              formButtonPrimary: {
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '700',
                textTransform: 'none',
                background: 'linear-gradient(135deg, var(--clr-navy), #2c3e50)',
                boxShadow: 'var(--shadow-sm)',
              },
              footerAction: { display: 'none' } // Solo permitimos entrar, el registro es vía invitación secreta
            }
          }}
        />
      </div>
    </div>
  );
}
