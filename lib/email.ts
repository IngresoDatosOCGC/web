/**
 * OCGC Email Service
 * Centraliza las notificaciones del sistema.
 * Recomendado: Configurar RESEND_API_KEY en .env
 */

export async function sendInvitationEmail(to: string, name: string, code: string) {
  const registerUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registro-usuarios?code=${code}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background: #0D1B2A; padding: 30px; text-align: center;">
        <img src="https://ocgc.es/wp-content/uploads/2021/05/logo-ocgc-blanco.png" alt="OCGC" width="120">
      </div>
      <div style="padding: 40px; color: #333; line-height: 1.6;">
        <h2 style="color: #0D1B2A; margin-top: 0;">¡Hola, ${name}!</h2>
        <p>Has sido invitado a formar parte del área privada de la <strong>Orquesta Comunitaria de Gran Canaria</strong>.</p>
        <p>A través de este portal podrás acceder a tus partituras, calendarios de ensayos y toda la información operativa del archivo digital.</p>
        <div style="margin: 40px 0; text-align: center;">
          <a href="${registerUrl}" style="background: #C9A84C; color: #0D1B2A; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Completar mi Ficha de Músico
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          Este enlace es personal y de un solo uso. Caducará automáticamente en 7 días.<br>
          Si tienes problemas con el botón, copia y pega este enlace en tu navegador:<br>
          <span style="color: #478AC9;">${registerUrl}</span>
        </p>
      </div>
      <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Orquesta Comunitaria de Gran Canaria · Asociación sin ánimo de lucro
      </div>
    </div>
  `;

  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (process.env.RESEND_API_KEY) {
    console.log(`[Email Service] Intentando envío real a ${to} a través de Resend...`);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: fromAddress, 
          to: [to],
          subject: "Invitación al Portal de Músicos — OCGC",
          html: html
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        console.error("❌ Fallo de envío en Resend:", resData);
      } else {
        console.log("✅ Email enviado correctamente (ID):", resData.id);
      }
      return resData;
    } catch (e) {
      console.error("❌ Error de red enviando email con Resend:", e);
    }
  } else {
    console.log(`[Email Service] MODO SIMULACIÓN (No hay API Key) para ${to}`);
  }
  
  return { success: true, simulated: true };
}

export async function sendAdminJoinNotification(data: any) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "archivo@ocgc.es";
  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
  
  const html = `
    <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 12px; max-width: 550px; margin: 0 auto; color: #333;">
      <h2 style="color: #0D1B2A; border-bottom: 2px solid #C9A84C; padding-bottom: 15px; margin-top: 0;">📩 Nueva solicitud OCGC</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Nombre:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.firstName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Apellidos:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Agrupación:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.group}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Instrumento:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.instrument || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #478AC9;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.phone}</td>
        </tr>
      </table>

      <div style="margin-top: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px; font-size: 14px;">
        <strong style="display: block; margin-bottom: 5px; color: #0D1B2A;">Trayectoria / Comentarios:</strong>
        <p style="margin: 0; line-height: 1.5; color: #666;">${data.experience || 'Sin comentarios adicionales.'}</p>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/miembros/gestion" style="background: #0D1B2A; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Gestionar en el Panel de Administración
        </a>
      </div>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    console.log(`[Email Service] Notificando administrador (${adminEmail}) vía Resend...`);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [adminEmail],
          subject: `Nueva Solicitud: ${data.firstName} ${data.lastName} (${data.group})`,
          html: html
        })
      });
      const resData = await res.json();
      if (!res.ok) console.error("❌ Fallo notificación admin en Resend:", resData);
      else console.log("✅ Notificación admin enviada");
    } catch (e) {
      console.error("❌ Error de red notificando al admin:", e);
    }
  } else {
    console.log(`[Email Service] MODO SIMULACIÓN (Notificación Admin): ${data.name}`);
  }
}
