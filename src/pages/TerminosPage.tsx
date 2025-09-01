import React from 'react';
import apcompanyLogo from '../apcompany.jpg';

const TerminosPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center py-12 px-2">
      <div className="relative w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-white drop-shadow-lg tracking-tight">Términos y Condiciones</h1>
        <div className="w-full text-slate-100 text-justify space-y-6 text-base md:text-lg">
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">1. Definiciones</h2>
            <p><b>Plataforma:</b> Se refiere al sistema web de generación de recibos y gestión de información de pacientes, desarrollado y operado por A.P Company.<br/>
            <b>Usuario:</b> Persona autorizada, trabajador de un centro de salud aprobado por la Región Sanitaria Departamental de Cortés, Honduras.<br/>
            <b>Paciente:</b> Persona cuyos datos son gestionados a través de la plataforma.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">2. Descripción del Servicio</h2>
            <p>La plataforma permite a los centros de salud de Honduras gestionar información de pacientes, generar recibos y reportes, y almacenar datos de manera segura y eficiente. El acceso está restringido a usuarios autorizados.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">3. Disponibilidad y Ámbito</h2>
            <p>El servicio está disponible únicamente en Honduras y dirigido a instituciones gubernamentales de salud aprobadas por la Región Sanitaria Departamental de Cortés. El uso fuera de este ámbito está prohibido salvo autorización expresa.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">4. Registro y Obligaciones del Usuario</h2>
            <p>El usuario debe proporcionar información veraz y mantener la confidencialidad de sus credenciales. Es responsable de toda actividad realizada bajo su cuenta y del uso correcto de los datos de pacientes.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">5. Privacidad y Protección de Datos</h2>
            <p>Los datos de usuarios y pacientes no serán compartidos ni vendidos a terceros. A.P Company implementa medidas de seguridad avanzadas para proteger la información. El usuario se compromete a respetar la privacidad de los datos gestionados.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">6. Propiedad Intelectual</h2>
            <p>Todos los derechos de la plataforma, su código, diseño, y contenido pertenecen a A.P Company. Queda prohibida la reproducción, distribución o modificación sin autorización escrita.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">7. Uso Adecuado y Subida de Información</h2>
            <p>El usuario debe subir información precisa y actualizada. El mal uso, manipulación o falsificación de datos puede resultar en la suspensión de la cuenta y acciones legales.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">8. Modificaciones y Actualizaciones</h2>
            <p>A.P Company podrá modificar la plataforma y estos términos en cualquier momento. Se notificará a los usuarios sobre cambios relevantes. El acceso a actualizaciones está sujeto al pago puntual del servicio.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">9. Suspensión y Terminación</h2>
            <p>A.P Company se reserva el derecho de suspender o cancelar cuentas por incumplimiento de estos términos, uso indebido o falta de pago, sin derecho a reembolso.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">10. Limitación de Responsabilidad</h2>
            <p>A.P Company no se hace responsable por el mal uso de la plataforma ni por daños derivados del uso incorrecto de los datos. La responsabilidad recae en los centros de salud y sus usuarios autorizados.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">11. Reembolsos</h2>
            <p>El servicio es no reembolsable una vez que el usuario ha accedido y utilizado la plataforma, salvo casos excepcionales evaluados por A.P Company.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">12. Jurisdicción y Ley Aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República de Honduras. Cualquier disputa será resuelta en los tribunales competentes de Honduras.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">13. Contacto</h2>
            <p>Para consultas, soporte o reportar problemas, comuníquese al correo: <a href="mailto:a.p.companyentertaiment@gmail.com" className="text-blue-300 underline">a.p.companyentertaiment@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-purple-300 mb-2">14. Aceptación de los Términos</h2>
            <p>El uso de la plataforma implica la aceptación total de estos términos y condiciones. Si no está de acuerdo, por favor absténgase de utilizar el servicio.</p>
          </section>
        </div>
        <div className="w-full flex justify-center mt-10">
          <div className="flex items-center bg-white/10 rounded-xl shadow-lg px-6 py-4 space-x-6 border border-white/20">
            <img src={apcompanyLogo} alt="Logo A.P Company" className="w-20 h-20 object-contain rounded shadow" />
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-bold text-white tracking-wide">A.P Company</span>
              <span className="text-sm text-purple-200 mt-1">WEB SERVICES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminosPage; 