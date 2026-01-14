'use client';

import { useState } from 'react';
import CalendarEvent from '@/components/calendar-event';
import { DocumentCalendar } from '@/components/document-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText } from 'lucide-react';

export default function Page() {
    const [activeTab, setActiveTab] = useState<string>('document');

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Calendario de Recepciones</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona tus documentos y eventos en un solo lugar
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="document" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Calendario de Documentos
                    </TabsTrigger>
                    <TabsTrigger value="events" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendario de Eventos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="document" className="mt-0">
                    <DocumentCalendar />
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                    <CalendarEvent />
                </TabsContent>
            </Tabs>
        </div>
    );
}
