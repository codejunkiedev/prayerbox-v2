import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [masjidName, setMasjidName] = useState("");
  const [masjidLocation, setMasjidLocation] = useState("");
  const [masjidLogo, setMasjidLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMasjidLogo(file);

      // Create preview URL for the logo
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = () => {
    setMasjidLogo(null);
    setPreviewLogo(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      masjidName,
      masjidLocation,
      masjidLogo,
    });
    // Here you would typically send the data to your backend
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Masjid Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="masjid-name">Masjid Name</Label>
          <Input
            id="masjid-name"
            value={masjidName}
            onChange={(e) => setMasjidName(e.target.value)}
            placeholder="Enter masjid name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="masjid-location">Masjid Location</Label>
          <Input
            id="masjid-location"
            value={masjidLocation}
            onChange={(e) => setMasjidLocation(e.target.value)}
            placeholder="Enter masjid location"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="masjid-logo">Masjid Logo</Label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Input
                id="masjid-logo"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
            </div>
            {previewLogo && (
              <div className="w-24 h-24 rounded overflow-hidden border relative">
                <button
                  type="button"
                  onClick={resetLogo}
                  className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-bl-md hover:bg-opacity-70"
                  aria-label="Remove logo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <img src={previewLogo} alt="Logo preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <Button type="submit">Save Masjid Profile</Button>
      </form>
    </div>
  );
}
