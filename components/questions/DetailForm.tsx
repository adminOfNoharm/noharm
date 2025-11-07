import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { DetailFormProps, DetailFormField } from "@/lib/interfaces";
import { getKYCPrefilledData } from "@/lib/utils/profile-management";
import { supabase } from "@/lib/supabase";

const DetailForm = ({ onChange, initialData = {}, required = true, subtext, fields = [], question }: DetailFormProps) => {
  const [data, setData] = useState<Record<string, string>>(initialData);

  useEffect(() => {
    const initializeData = async () => {
      let mappedData = { ...initialData };
      
      // Auto-populate name and email if fields are empty
      if (Object.keys(mappedData).length === 0) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const prefilledData = await getKYCPrefilledData(session.user.id);
            if (prefilledData) {
              // Only populate if the field exists in the form and is empty
              fields.forEach(field => {
                if (field.alias === 'firstName' && prefilledData.firstName) {
                  mappedData[field.alias] = prefilledData.firstName;
                }
                if (field.alias === 'lastName' && prefilledData.lastName) {
                  mappedData[field.alias] = prefilledData.lastName;
                }
                if (field.alias === 'email' && prefilledData.email) {
                  mappedData[field.alias] = prefilledData.email;
                }
              });
            }
          }
        } catch (error) {
          console.error('Error auto-populating form data:', error);
        }
      }
      
      // Handle phone fields
      fields.forEach(field => {
        if (field.type === 'phone' && mappedData[field.alias]) {
          const phoneValue = mappedData[field.alias];
          // If the phone number doesn't include a country code, add the default
          if (!phoneValue.startsWith('+')) {
            mappedData[`${field.alias}_countryCode`] = '+1';
            mappedData[field.alias] = phoneValue;
          } else {
            // Extract country code and number
            const [countryCode, ...rest] = phoneValue.split(' ');
            mappedData[`${field.alias}_countryCode`] = countryCode;
            mappedData[field.alias] = rest.join(' ');
          }
        }
      });
      
      setData(mappedData);
    };

    initializeData();
  }, [initialData, fields]);

  const handleInputChange = (field: DetailFormField, value: string) => {
    const updatedData = { ...data };
    
    if (field.type === 'phone') {
      const countryCode = data[`${field.alias}_countryCode`] || '+1';
      // Only update the number part, keeping the country code
      updatedData[field.alias] = value;
      // Combine country code and number for the onChange callback
      const fullNumber = `${countryCode} ${value}`;
      onChange({ ...updatedData, [field.alias]: fullNumber });
    } else {
      updatedData[field.alias] = value;
      onChange(updatedData);
    }
    
    setData(updatedData);
  };

  // Helper function to render label with required asterisk if needed
  const renderLabel = (field: DetailFormField) => (
    <label className="text-sm text-gray-600">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderField = (field: DetailFormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            className="h-16 border-gray-300 shadow-none"
            value={data[field.alias] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        // Determine height class based on the textareaHeight property
        const heightClass = field.textareaHeight === 'small' ? 'h-24' : 
                           field.textareaHeight === 'large' ? 'h-48' : 
                           'h-32'; // medium (default)
        return (
          <textarea
            className={`w-full ${heightClass} p-4 border border-gray-300 rounded-md shadow-none resize-none`}
            value={data[field.alias] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            className="h-16 border-gray-300 shadow-none"
            value={data[field.alias] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'phone':
        return (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <Select 
                value={data[`${field.alias}_countryCode`] || '+1'}
                onValueChange={(val) => {
                  const updatedData = { ...data, [`${field.alias}_countryCode`]: val };
                  const fullNumber = `${val} ${data[field.alias] || ''}`;
                  setData(updatedData);
                  onChange({ ...updatedData, [field.alias]: fullNumber });
                }}
              >
                <SelectTrigger className="h-16 border-gray-300 shadow-none w-full">
                  <SelectValue>{data[`${field.alias}_countryCode`] || '+1'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="overflow-y-auto">
                    {countryCodes.map((country) => (
                      <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{country.code}</span>
                          <span className="text-gray-600 text-sm">{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Input
                className="h-16 border-gray-300 shadow-none"
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                value={data[field.alias] || ''}
                onChange={(e) => {
                  // Remove any non-numeric characters
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange(field, numericValue);
                }}
                placeholder={field.placeholder}
                required={field.required}
                aria-required={field.required}
                aria-label={field.label}
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <Select 
            value={data[field.alias] || undefined}
            onValueChange={(val) => handleInputChange(field, val)}
          >
            <SelectTrigger className="h-16 border-gray-300 shadow-none">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.filter(option => option.trim() !== '').map((option) => (
                <SelectItem key={`${field.alias}-${option}`} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  // Function to chunk fields into groups of 2 for grid layout
  const chunkFields = (fields: DetailFormField[]) => {
    const chunks: DetailFormField[][] = [];
    let currentChunk: DetailFormField[] = [];
    let currentWidth = 0;

    fields.forEach(field => {
      const fieldWidth = field.columnSpan || 1;
      
      // If adding this field would exceed 2 columns, start a new chunk
      if (currentWidth + fieldWidth > 2) {
        chunks.push(currentChunk);
        currentChunk = [field];
        currentWidth = fieldWidth;
      } else {
        currentChunk.push(field);
        currentWidth += fieldWidth;
      }
    });

    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  };

  // Special handling for title and first name to be on the same row
  const titleField = fields.find(f => f.alias === 'title');
  const firstNameField = fields.find(f => f.alias === 'firstName');
  const otherFields = fields.filter(f => f.alias !== 'title' && f.alias !== 'firstName');
  const chunkedOtherFields = chunkFields(otherFields);

  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <h2 className="text-2xl font-semibold tracking-wide font-primary">{question}</h2>
        {subtext && (
          <p className="text-gray-600 text-lg font-secondary mt-2">{subtext}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid gap-6 pt-10">
        {/* Title and First Name row */}
        {titleField && firstNameField && (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              {renderLabel(titleField)}
              {renderField(titleField)}
            </div>
            <div className="col-span-3">
              {renderLabel(firstNameField)}
              {renderField(firstNameField)}
            </div>
          </div>
        )}

        {/* Other fields in pairs */}
        {chunkedOtherFields.map((chunk, index) => (
          <div key={index} className="grid grid-cols-2 gap-6">
            {chunk.map((field) => {
              // Determine column span class based on the field's columnSpan property
              const colSpanClass = field.columnSpan === 2 ? 'col-span-2' : 'col-span-1';
              
              return (
              <div 
                key={`${field.alias}-${index}`} 
                  className={`font-secondary ${colSpanClass}`}
              >
                {renderLabel(field)}
                {renderField(field)}
              </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Country codes data
const countryCodes = [
  { code: "+93", name: "Afghanistan" },
  { code: "+355", name: "Albania" },
  { code: "+213", name: "Algeria" },
  { code: "+376", name: "Andorra" },
  { code: "+244", name: "Angola" },
  { code: "+1-268", name: "Antigua and Barbuda" },
  { code: "+54", name: "Argentina" },
  { code: "+374", name: "Armenia" },
  { code: "+61", name: "Australia" },
  { code: "+43", name: "Austria" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+1-242", name: "Bahamas" },
  { code: "+973", name: "Bahrain" },
  { code: "+880", name: "Bangladesh" },
  { code: "+1-246", name: "Barbados" },
  { code: "+375", name: "Belarus" },
  { code: "+32", name: "Belgium" },
  { code: "+501", name: "Belize" },
  { code: "+229", name: "Benin" },
  { code: "+975", name: "Bhutan" },
  { code: "+591", name: "Bolivia" },
  { code: "+387", name: "Bosnia and Herzegovina" },
  { code: "+267", name: "Botswana" },
  { code: "+55", name: "Brazil" },
  { code: "+673", name: "Brunei" },
  { code: "+359", name: "Bulgaria" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+257", name: "Burundi" },
  { code: "+855", name: "Cambodia" },
  { code: "+237", name: "Cameroon" },
  { code: "+1", name: "Canada" },
  { code: "+238", name: "Cape Verde" },
  { code: "+236", name: "Central African Republic" },
  { code: "+235", name: "Chad" },
  { code: "+56", name: "Chile" },
  { code: "+86", name: "China" },
  { code: "+57", name: "Colombia" },
  { code: "+269", name: "Comoros" },
  { code: "+242", name: "Republic of the Congo" },
  { code: "+243", name: "Democratic Republic of the Congo" },
  { code: "+506", name: "Costa Rica" },
  { code: "+225", name: "Côte d'Ivoire" },
  { code: "+385", name: "Croatia" },
  { code: "+53", name: "Cuba" },
  { code: "+357", name: "Cyprus" },
  { code: "+420", name: "Czech Republic" },
  { code: "+45", name: "Denmark" },
  { code: "+253", name: "Djibouti" },
  { code: "+1-767", name: "Dominica" },
  { code: "+1-809", name: "Dominican Republic" },
  { code: "+670", name: "East Timor" },
  { code: "+593", name: "Ecuador" },
  { code: "+20", name: "Egypt" },
  { code: "+503", name: "El Salvador" },
  { code: "+240", name: "Equatorial Guinea" },
  { code: "+291", name: "Eritrea" },
  { code: "+372", name: "Estonia" },
  { code: "+251", name: "Ethiopia" },
  { code: "+679", name: "Fiji" },
  { code: "+358", name: "Finland" },
  { code: "+33", name: "France" },
  { code: "+241", name: "Gabon" },
  { code: "+220", name: "Gambia" },
  { code: "+995", name: "Georgia" },
  { code: "+49", name: "Germany" },
  { code: "+233", name: "Ghana" },
  { code: "+30", name: "Greece" },
  { code: "+1-473", name: "Grenada" },
  { code: "+299", name: "Greenland" },
  { code: "+502", name: "Guatemala" },
  { code: "+224", name: "Guinea" },
  { code: "+245", name: "Guinea-Bissau" },
  { code: "+592", name: "Guyana" },
  { code: "+509", name: "Haiti" },
  { code: "+504", name: "Honduras" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+354", name: "Iceland" },
  { code: "+91", name: "India" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+964", name: "Iraq" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+1-876", name: "Jamaica" },
  { code: "+81", name: "Japan" },
  { code: "+962", name: "Jordan" },
  { code: "+7", name: "Kazakhstan" },
  { code: "+254", name: "Kenya" },
  { code: "+686", name: "Kiribati" },
  { code: "+383", name: "Kosovo" },
  { code: "+965", name: "Kuwait" },
  { code: "+996", name: "Kyrgyzstan" },
  { code: "+856", name: "Laos" },
  { code: "+371", name: "Latvia" },
  { code: "+961", name: "Lebanon" },
  { code: "+266", name: "Lesotho" },
  { code: "+231", name: "Liberia" },
  { code: "+218", name: "Libya" },
  { code: "+423", name: "Liechtenstein" },
  { code: "+370", name: "Lithuania" },
  { code: "+352", name: "Luxembourg" },
  { code: "+853", name: "Macau" },
  { code: "+389", name: "North Macedonia" },
  { code: "+261", name: "Madagascar" },
  { code: "+265", name: "Malawi" },
  { code: "+60", name: "Malaysia" },
  { code: "+960", name: "Maldives" },
  { code: "+223", name: "Mali" },
  { code: "+356", name: "Malta" },
  { code: "+692", name: "Marshall Islands" },
  { code: "+230", name: "Mauritius" },
  { code: "+52", name: "Mexico" },
  { code: "+691", name: "Micronesia" },
  { code: "+373", name: "Moldova" },
  { code: "+377", name: "Monaco" },
  { code: "+976", name: "Mongolia" },
  { code: "+382", name: "Montenegro" },
  { code: "+212", name: "Morocco" },
  { code: "+258", name: "Mozambique" },
  { code: "+95", name: "Myanmar" },
  { code: "+264", name: "Namibia" },
  { code: "+674", name: "Nauru" },
  { code: "+977", name: "Nepal" },
  { code: "+31", name: "Netherlands" },
  { code: "+64", name: "New Zealand" },
  { code: "+505", name: "Nicaragua" },
  { code: "+227", name: "Niger" },
  { code: "+234", name: "Nigeria" },
  { code: "+850", name: "North Korea" },
  { code: "+47", name: "Norway" },
  { code: "+968", name: "Oman" },
  { code: "+92", name: "Pakistan" },
  { code: "+680", name: "Palau" },
  { code: "+970", name: "Palestine" },
  { code: "+507", name: "Panama" },
  { code: "+675", name: "Papua New Guinea" },
  { code: "+595", name: "Paraguay" },
  { code: "+51", name: "Peru" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+974", name: "Qatar" },
  { code: "+40", name: "Romania" },
  { code: "+7", name: "Russia" },
  { code: "+250", name: "Rwanda" },
  { code: "+1-869", name: "Saint Kitts and Nevis" },
  { code: "+1-758", name: "Saint Lucia" },
  { code: "+1-784", name: "Saint Vincent and the Grenadines" },
  { code: "+685", name: "Samoa" },
  { code: "+378", name: "San Marino" },
  { code: "+239", name: "São Tomé and Príncipe" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+221", name: "Senegal" },
  { code: "+381", name: "Serbia" },
  { code: "+248", name: "Seychelles" },
  { code: "+232", name: "Sierra Leone" },
  { code: "+65", name: "Singapore" },
  { code: "+421", name: "Slovakia" },
  { code: "+386", name: "Slovenia" },
  { code: "+677", name: "Solomon Islands" },
  { code: "+252", name: "Somalia" },
  { code: "+27", name: "South Africa" },
  { code: "+82", name: "South Korea" },
  { code: "+211", name: "South Sudan" },
  { code: "+34", name: "Spain" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+249", name: "Sudan" },
  { code: "+597", name: "Suriname" },
  { code: "+268", name: "Eswatini" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+963", name: "Syria" },
  { code: "+886", name: "Taiwan" },
  { code: "+992", name: "Tajikistan" },
  { code: "+255", name: "Tanzania" },
  { code: "+66", name: "Thailand" },
  { code: "+228", name: "Togo" },
  { code: "+676", name: "Tonga" },
  { code: "+1-868", name: "Trinidad and Tobago" },
  { code: "+216", name: "Tunisia" },
  { code: "+90", name: "Turkey" },
  { code: "+993", name: "Turkmenistan" },
  { code: "+688", name: "Tuvalu" },
  { code: "+256", name: "Uganda" },
  { code: "+380", name: "Ukraine" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+44", name: "United Kingdom" },
  { code: "+1", name: "United States" },
  { code: "+598", name: "Uruguay" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+678", name: "Vanuatu" },
  { code: "+39", name: "Vatican City" },
  { code: "+58", name: "Venezuela" },
  { code: "+84", name: "Vietnam" },
  { code: "+967", name: "Yemen" },
  { code: "+260", name: "Zambia" },
  { code: "+263", name: "Zimbabwe" },
];



export default DetailForm; 