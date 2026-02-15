import { Link } from "react-router-dom";
import { CreditCard, ArrowRight } from "lucide-react";

const FeePaymentSection = () => {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container-custom">
        <div className="bg-school-green rounded-2xl p-8 md:p-10 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="h-8 w-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Pay School Fees Online</h2>
              <p className="text-white/80 text-sm">Quick and easy fee payment options for parents</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/admissions#fees"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors text-sm"
              >
                Visit Fee Payment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/feedesk"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors text-sm"
              >
                Visit FeeDesk Portal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeePaymentSection;
