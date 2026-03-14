import { useState } from 'react';
import { useSaveCallerUserProfile, useRequestApproval } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Gender, ExternalBlob } from '../backend';
import { Upload, Loader2 } from 'lucide-react';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.nonBinary);
  const [bio, setBio] = useState('');
  const [creativeField, setCreativeField] = useState('');
  const [interests, setInterests] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const saveProfile = useSaveCallerUserProfile();
  const requestApproval = useRequestApproval();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoFile) {
      alert('Please upload a photo');
      return;
    }

    try {
      // Convert file to bytes
      const arrayBuffer = await photoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with upload progress
      const photoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);

      await saveProfile.mutateAsync({
        name,
        age: parseInt(age),
        gender,
        bio,
        photo: photoBlob,
        creativeFieldText: creativeField,
        interests: interestsArray,
      });

      // Request approval after profile is saved
      await requestApproval.mutateAsync();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const isLoading = saveProfile.isPending || requestApproval.isPending;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-3xl text-white">Create Your Profile</CardTitle>
          <CardDescription className="text-white/70">
            Tell us about yourself to join the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <Label htmlFor="photo" className="text-white">Profile Photo</Label>
              <div className="mt-2">
                {photoPreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-pink-400"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-0 right-0"
                      onClick={() => document.getElementById('photo')?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo"
                    className="flex flex-col items-center justify-center w-32 h-32 mx-auto border-2 border-dashed border-white/30 rounded-full cursor-pointer hover:border-pink-400 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-white/50" />
                    <span className="text-xs text-white/50 mt-2">Upload</span>
                  </label>
                )}
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  required
                />
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 text-center mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Your name"
              />
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age" className="text-white">Age</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Your age"
              />
            </div>

            {/* Gender */}
            <div>
              <Label className="text-white">Gender</Label>
              <RadioGroup value={gender} onValueChange={(value) => setGender(value as Gender)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.male} id="male" className="border-white/30 text-pink-400" />
                  <Label htmlFor="male" className="text-white cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.female} id="female" className="border-white/30 text-pink-400" />
                  <Label htmlFor="female" className="text-white cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.nonBinary} id="nonBinary" className="border-white/30 text-pink-400" />
                  <Label htmlFor="nonBinary" className="text-white cursor-pointer">Non-Binary</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Creative Field */}
            <div>
              <Label htmlFor="creativeField" className="text-white">Creative Field</Label>
              <Input
                id="creativeField"
                value={creativeField}
                onChange={(e) => setCreativeField(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="e.g., Music, Film, Fashion, Tech"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Interests */}
            <div>
              <Label htmlFor="interests" className="text-white">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="e.g., Photography, Travel, Art"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile & Request Approval'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
