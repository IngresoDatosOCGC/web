import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <SignIn 
        path="/sign-in" 
        appearance={{
          elements: {
            footerAction: { display: 'none' }
          }
        }}
      />
    </div>
  );
}
