import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Users, BarChart3, Heart, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto"> {/* Reduced from max-w-5xl to max-w-2xl */}
        {/* All Content in One Box */}
        <div className="bg-white rounded-lg shadow-sm border p-6"> {/* Reduced padding from p-8 to p-6 */}
          {/* SLP Logo Only */}
          <div className="flex justify-center items-center mb-6"> {/* Reduced margin */}
            <div className="w-full">
              <div className="flex flex-col items-center justify-center">
                <img 
                  src="/slp.png" 
                  alt="Sustainable Livelihood Program" 
                  className="h-20 w-auto object-contain mx-auto mb-3" 
                />
                <h2 className="text-xl font-bold text-green-800 mb-2 leading-tight tracking-tight"> {/* Reduced text size, added tracking */}
                  SUSTAINABLE LIVELIHOOD PROGRAM
                </h2>
                <p className="text-base text-red-600 font-semibold italic leading-tight"> {/* Reduced text size */}
                  "Sibol Kakayahan, Sibol Kabuhayan"
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-tight"> {/* Reduced text size and margin */}
                  Department of Social Welfare and Development
                </p>
              </div>
            </div>
          </div>

          {/* Program Description */}
          <div className="mb-6"> {/* Reduced margin */}
            <p className="text-gray-700 leading-relaxed text-center text-sm tracking-normal"> {/* Reduced text size, added tracking */}
              SLP is a capability-building program that provides access to opportunities that increase 
              the productivity of the livelihood assets of poor, vulnerable, and marginalized communities, 
              in order to improve their socio-economic well-being.
            </p>
          </div>
          
          {/* Program Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-6"> {/* Reduced gap and margin */}
            <div className="text-center p-3"> {/* Reduced padding */}
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"> {/* Reduced icon container */}
                <Heart className="h-5 w-5 text-blue-600" /> {/* Reduced icon size */}
              </div>
              <h3 className="font-semibold mb-1 text-sm tracking-tight">Social Welfare</h3> {/* Reduced text size, added tracking */}
              <p className="text-xs text-gray-600 leading-tight">Supporting vulnerable communities</p> {/* Reduced text size */}
            </div>
            <div className="text-center p-3">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1 text-sm tracking-tight">Livelihood Support</h3>
              <p className="text-xs text-gray-600 leading-tight">Empowering communities</p>
            </div>
            <div className="text-center p-3">
              <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1 text-sm tracking-tight">Program Management</h3>
              <p className="text-xs text-gray-600 leading-tight">Monitoring and evaluation</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 flex-wrap mb-4"> {/* Reduced gap and added margin */}
            <Link href="/auth/register">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-6"> {/* Reduced text size and padding */}
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-700 hover:bg-gray-100 text-sm px-6"> {/* Reduced text size and padding */}
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Footer inside the same box */}
          <div className="text-center text-gray-500 text-xs mt-4 pt-4 border-t leading-tight"> {/* Reduced text size and spacing */}
            <p>Department of Social Welfare and Development - Sustainable Livelihood Program</p>
            <p className="mt-1">© 2024 DSWD. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}