import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="w-full bg-[rgb(var(--color-background-hover))] border border-[rgb(var(--color-border))] rounded-lg mt-4 text-[rgb(var(--color-text-muted))] py-8 px-4">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Top Section - Security and Payments */}
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img className="h-20" src="/secure.webp" alt="" />
              <div>
                <div className="font-bold text-[rgb(var(--color-text-primary))]">100% SAFE</div>
                <div className="text-sm">Protected Connection</div>
                <div className="text-sm">and encrypted data.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="container mx-auto">
          <nav className="flex flex-wrap gap-4 mb-6">
            <Link to="/kyc" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              KYC Policy
            </Link>
            <Link to="/privacy-policy" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/self-exclusion" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Self-Exclusion
            </Link>
            <Link to="/aml" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              AML
            </Link>
            <Link to="/about" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              About
            </Link>
          </nav>

          {/* Legal Text */}
          <div className="text-sm text-[rgb(var(--color-text-muted))] mb-8 space-y-4">
            <p>
              This website is operated by{" "}
              <Link to="#" className="text-[rgb(var(--color-primary))] hover:underline">
                RAEEN Exchange N.V.
              </Link>
              , registered under No. 155342 at{" "}
              <Link to="#" className="text-[rgb(var(--color-primary))] hover:underline">
                Schottegateweg Zuid 72 A, Curaçao
              </Link>
              . This website is licensed and regulated by{" "}
              <Link to="#" className="text-[rgb(var(--color-primary))] hover:underline">
                Curaçao Gaming
              </Link>
              , license No. 1668/JAZ.
            </p>
            <p>
              In order to register for this website, the user is required to accept the General Terms and Conditions. In
              the event the General Terms and Conditions are updated, existing users may choose to discontinue using the
              products and services before the said update shall become effective, which is a minimum of two weeks after
              it has been announced.
            </p>
          </div>

          {/* Bottom Navigation */}
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link to="/responsible-gambling" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Responsible Gambling
            </Link>
            <Link to="/terms" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/betting-rules" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Betting Rules
            </Link>
            <Link to="/dispute" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Dispute Resolution
            </Link>
            <Link to="/fairness" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Fairness & RNG Testing Methods
            </Link>
            <Link to="/accounts" className="hover:text-[rgb(var(--color-primary))] transition-colors">
              Accounts, Payouts and Bonuses
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Top Navigation Links */}
        <div className="grid grid-cols-5 gap-2 text-center mb-4">
          <Link to="/kyc" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
            KYC Policy
          </Link>
          <Link to="/privacy-policy" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/self-exclusion" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
            Self-Exclusion
          </Link>
          <Link to="/aml" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
            AML
          </Link>
          <Link to="/about" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
            About
          </Link>
        </div>

        {/* Legal Text */}
        <div className="text-sm text-[rgb(var(--color-text-muted))] mb-6">
          <p>
            This website is operated by{" "}
            <Link to="#" className="text-[rgb(var(--color-primary))] hover:underline">
              RAEEN Exchange N.V.
            </Link>
            , registered under No. 155342 at{" "}
            <Link to="#" className="text-[rgb(var(--color-primary))] hover:underline">
              Schottegateweg Oost 72 A, Curaçao
            </Link>
            . This website is licensed and regulated by{" "}
            <Link to="#" className="text-[rgb(var(--color-primary))] hover:underline">
              Curaçao eGaming
            </Link>
            , license No. 1668/JAZ. In order to register for this website, the user is required to accept the General
            Terms and Conditions. In the event the General Terms and Conditions are updated, existing users may choose
            to discontinue using the products and services before the said update shall become effective, which is a
            minimum of two weeks after it has been announced.
          </p>
        </div>

        {/* Security Section */}
        <div className="flex flex-col items-start mb-6">
          <img className="h-16 mb-2" src="/secure.webp" alt="Secure SSL Encryption" />
          <div className="font-bold text-[rgb(var(--color-text-primary))]">100% SAFE</div>
          <div className="text-sm text-center">Protected connection and encrypted data.</div>
        </div>

       

        

        {/* Bottom Navigation */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 mb-2">
            <Link
              to="/responsible-gambling"
              className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors"
            >
              Responsible Gambling
            </Link>
            <Link to="/terms" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
              Terms & Conditions
            </Link>
          </div>
          <div className="flex justify-center gap-4 mb-2">
            <Link to="/betting-rules" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
              Betting Rules
            </Link>
            <Link to="/dispute" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
              Dispute Resolution
            </Link>
          </div>
          <div className="flex justify-center gap-4">
            <Link to="/fairness" className="text-xs hover:text-[rgb(var(--color-primary))] transition-colors">
              Fairness & RNG Testing Methods
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

