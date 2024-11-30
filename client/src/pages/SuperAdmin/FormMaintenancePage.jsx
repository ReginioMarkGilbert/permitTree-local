import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   FormInput,
   FileText,
   Save,
   Plus,
   Trash2,
   Edit2,
   ChevronDown,
   ChevronUp
} from 'lucide-react';
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

const forms = [
   {
      id: 'csaw',
      name: 'Chainsaw Registration',
      sections: [
         {
            id: 'registration-type',
            title: 'Registration Type',
            fields: [
               {
                  id: 'reg-type-1',
                  type: 'radio',
                  label: 'New Registration',
                  value: 'New',
                  required: true,
                  enabled: true
               },
               {
                  id: 'reg-type-2',
                  type: 'radio',
                  label: 'Renewal',
                  value: 'Renewal',
                  required: true,
                  enabled: true
               }
            ]
         },
         {
            id: 'chainsaw-details',
            title: 'Chainsaw Details',
            fields: [
               {
                  id: 'brand',
                  type: 'text',
                  label: 'Brand',
                  placeholder: 'Enter Brand',
                  required: true,
                  enabled: true
               },
               {
                  id: 'model',
                  type: 'text',
                  label: 'Model',
                  placeholder: 'Enter Model',
                  required: true,
                  enabled: true
               },
               // Add more fields as needed
            ]
         }
      ]
   },
   // Add more forms as needed
];

const FormMaintenancePage = () => {
   const [selectedForm, setSelectedForm] = useState(forms[0]);
   const [editMode, setEditMode] = useState(false);

   const handleFieldToggle = (sectionId, fieldId) => {
      // Implementation for toggling field visibility
      toast.success(`Field visibility updated`);
   };

   const handleRequiredToggle = (sectionId, fieldId) => {
      // Implementation for toggling required status
      toast.success(`Field required status updated`);
   };

   const handleSaveChanges = () => {
      // Implementation for saving form changes
      toast.success('Form changes saved successfully');
      setEditMode(false);
   };

   const handleAddField = (sectionId) => {
      // Implementation for adding new field
      toast.success('New field added');
   };

   const handleAddSection = () => {
      // Implementation for adding new section
      toast.success('New section added');
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
         <div className="p-8 max-w-7xl mx-auto pt-24">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h1 className="text-3xl font-bold">Form Maintenance</h1>
                  <p className="text-muted-foreground mt-2">Manage and customize application forms</p>
               </div>
               <div className="flex gap-4">
                  <Button
                     variant={editMode ? "secondary" : "outline"}
                     onClick={() => setEditMode(!editMode)}
                  >
                     <Edit2 className="w-4 h-4 mr-2" />
                     {editMode ? 'Cancel Editing' : 'Edit Forms'}
                  </Button>
                  {editMode && (
                     <Button onClick={handleSaveChanges}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                     </Button>
                  )}
               </div>
            </div>

            <Tabs defaultValue={selectedForm.id} className="space-y-4">
               <TabsList>
                  {forms.map(form => (
                     <TabsTrigger
                        key={form.id}
                        value={form.id}
                        onClick={() => setSelectedForm(form)}
                     >
                        {form.name}
                     </TabsTrigger>
                  ))}
               </TabsList>

               {forms.map(form => (
                  <TabsContent key={form.id} value={form.id}>
                     <Card className="p-6">
                        <Accordion type="single" collapsible className="w-full">
                           {form.sections.map(section => (
                              <AccordionItem key={section.id} value={section.id}>
                                 <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-2">
                                       <FormInput className="w-4 h-4" />
                                       <span>{section.title}</span>
                                    </div>
                                 </AccordionTrigger>
                                 <AccordionContent>
                                    <div className="space-y-4">
                                       {section.fields.map(field => (
                                          <div
                                             key={field.id}
                                             className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                                          >
                                             <div className="flex-1">
                                                <Label className="font-medium">{field.label}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                   Type: {field.type}
                                                </p>
                                             </div>
                                             {editMode && (
                                                <div className="flex items-center gap-4">
                                                   <div className="flex items-center gap-2">
                                                      <Label htmlFor={`${field.id}-enabled`} className="text-sm">
                                                         Enabled
                                                      </Label>
                                                      <Switch
                                                         id={`${field.id}-enabled`}
                                                         checked={field.enabled}
                                                         onCheckedChange={() => handleFieldToggle(section.id, field.id)}
                                                      />
                                                   </div>
                                                   <div className="flex items-center gap-2">
                                                      <Label htmlFor={`${field.id}-required`} className="text-sm">
                                                         Required
                                                      </Label>
                                                      <Switch
                                                         id={`${field.id}-required`}
                                                         checked={field.required}
                                                         onCheckedChange={() => handleRequiredToggle(section.id, field.id)}
                                                      />
                                                   </div>
                                                   <Button
                                                      variant="destructive"
                                                      size="icon"
                                                      className="h-8 w-8"
                                                   >
                                                      <Trash2 className="h-4 w-4" />
                                                   </Button>
                                                </div>
                                             )}
                                          </div>
                                       ))}
                                       {editMode && (
                                          <Button
                                             variant="outline"
                                             className="w-full"
                                             onClick={() => handleAddField(section.id)}
                                          >
                                             <Plus className="w-4 h-4 mr-2" />
                                             Add Field
                                          </Button>
                                       )}
                                    </div>
                                 </AccordionContent>
                              </AccordionItem>
                           ))}
                        </Accordion>
                        {editMode && (
                           <Button
                              variant="outline"
                              className="w-full mt-4"
                              onClick={handleAddSection}
                           >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Section
                           </Button>
                        )}
                     </Card>
                  </TabsContent>
               ))}
            </Tabs>
         </div>
      </div>
   );
};

export default FormMaintenancePage;
