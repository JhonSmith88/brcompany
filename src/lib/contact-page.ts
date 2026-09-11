import { site } from '../data/site';
import { getSupabase } from './supabase';

export type ContactPageCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  description: string;
  whatsappTitle: string;
  whatsappText: string;
  whatsappCta: string;
  whatsappContext: string;
  infoTitle: string;
  emailLabel: string;
  locationLabel: string;
  location: string;
  hoursLabel: string;
  hours: string;
  infoCta: string;
};

export const defaultContactPageCopy: ContactPageCopy = {
  eyebrow: 'Atención',
  title: 'Contacto',
  lead: 'Todos los pedidos se gestionan por WhatsApp. Escríbenos y te respondemos con disponibilidad y opciones de entrega.',
  description: `Contacta a ${site.name} por WhatsApp para pedidos, disponibilidad y asesoría.`,
  whatsappTitle: 'WhatsApp',
  whatsappText: 'Ideal para consultas de stock, medidas, comparación entre modelos y seguimiento de tu pedido.',
  whatsappCta: 'Pedir por WhatsApp',
  whatsappContext: 'Quiero hacer una consulta.',
  infoTitle: 'Correo y ubicación',
  emailLabel: 'Email',
  locationLabel: 'Ubicación',
  location: site.location,
  hoursLabel: 'Horario orientativo',
  hours: 'Lunes a sábado · 10:00 – 19:00',
  infoCta: 'Preferimos WhatsApp',
};

export async function getContactPageCopy(): Promise<ContactPageCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contact_page')
      .select(
        'eyebrow, title, lead, description, whatsapp_title, whatsapp_text, whatsapp_cta, whatsapp_context, info_title, email_label, location_label, location, hours_label, hours, info_cta',
      )
      .eq('id', 'contact')
      .maybeSingle();

    if (error || !data) return defaultContactPageCopy;

    return {
      eyebrow: data.eyebrow?.trim() || defaultContactPageCopy.eyebrow,
      title: data.title?.trim() || defaultContactPageCopy.title,
      lead: data.lead?.trim() || defaultContactPageCopy.lead,
      description: data.description?.trim() || defaultContactPageCopy.description,
      whatsappTitle: data.whatsapp_title?.trim() || defaultContactPageCopy.whatsappTitle,
      whatsappText: data.whatsapp_text?.trim() || defaultContactPageCopy.whatsappText,
      whatsappCta: data.whatsapp_cta?.trim() || defaultContactPageCopy.whatsappCta,
      whatsappContext: data.whatsapp_context?.trim() || defaultContactPageCopy.whatsappContext,
      infoTitle: data.info_title?.trim() || defaultContactPageCopy.infoTitle,
      emailLabel: data.email_label?.trim() || defaultContactPageCopy.emailLabel,
      locationLabel: data.location_label?.trim() || defaultContactPageCopy.locationLabel,
      location: data.location?.trim() || defaultContactPageCopy.location,
      hoursLabel: data.hours_label?.trim() || defaultContactPageCopy.hoursLabel,
      hours: data.hours?.trim() || defaultContactPageCopy.hours,
      infoCta: data.info_cta?.trim() || defaultContactPageCopy.infoCta,
    };
  } catch {
    return defaultContactPageCopy;
  }
}
