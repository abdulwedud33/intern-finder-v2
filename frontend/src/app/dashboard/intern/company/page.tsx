import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-600 font bold text-3xl mt-1">Browse Companies</h1>
        </div>
      </div>
      <hr />

      {/* Search and location  */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Company Name or Keyword" className="pl-10" />
        </div>
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Location" className="pl-10" />
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 w-full sm:w-auto">Search</Button>
      </div>
      <hr />

      {/* Filter Tags */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600 whitespace-nowrap">Industry:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Technology
          </Button>
          <Button variant="outline" size="sm">
            Business Service
          </Button>
          <Button variant="outline" size="sm">
            Real Estate
          </Button>
          <Button variant="outline" size="sm">
            Consumer Service
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
            Non-profit
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
            Logistics
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent">
            Healthcare
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent">
            Construction
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:inline-flex bg-transparent">
            Telecommunications
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:inline-flex bg-transparent">
            Manufacturing
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:inline-flex bg-transparent">
            Food & Beverage
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:inline-flex bg-transparent">
            Marketing
          </Button>
          <Button variant="outline" size="sm">
            Company Size
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden bg-transparent">
            +More
          </Button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Stripe */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src="https://logo.clearbit.com/stripe.com" alt="Stripe Logo" />
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">Stripe</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every
              size—from new startups to public companies—use our software to accept payments and manage their businesses
              online.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 truncate">Payment platform</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-2">2 jobs</span>
            </div>
          </CardContent>
        </Card>

        {/* Truebill */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src="https://logo.clearbit.com/truebill.com" alt="Truebill Logo" />
                <AvatarFallback>TB</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">Truebill</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              Truebill develops a mobile app that helps consumers take control of their financial lives by canceling
              unwanted subscriptions, lowering bills, and providing spending insights.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 truncate">Finance</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-2">1 job</span>
            </div>
          </CardContent>
        </Card>

        {/* Square */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src="https://logo.clearbit.com/squareup.com" alt="Square Logo" />
                <AvatarFallback>SQ</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">Square</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              Square builds common business tools in unconventional ways so more people can start, run, and grow their
              businesses. When Square started, it was difficult and expensive (or just plain impossible) for some
              businesses to take credit cards.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 truncate">Payment platform</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-2">3 jobs</span>
            </div>
          </CardContent>
        </Card>

        {/* CoinBase */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
             <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src="https://logo.clearbit.com/coinbase.com" alt="CoinBase Logo" />
                <AvatarFallback>CB</AvatarFallback>
             </Avatar>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">CoinBase</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              Coinbase is a digital currency wallet and platform where merchants and consumers can transact with new
              digital currencies like bitcoin, ethereum, and litecoin.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 truncate">Cryptocurrency</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-2">2 jobs</span>
            </div>
          </CardContent>
        </Card>

        {/* Robinhood */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src="https://logo.clearbit.com/robinhood.com" alt="Robinhood Logo" />
                <AvatarFallback>RH</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">Robinhood</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              Robinhood is a commission-free investing app that lets you trade stocks, ETFs, options, and
              cryptocurrencies, all in one place. Our mission is to democratize finance for all.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 truncate">Finance</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-2">4 jobs</span>
            </div>
          </CardContent>
        </Card>

        {/* Medium */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src="https://logo.clearbit.com/medium.com" alt="Medium Logo" />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">Medium</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              Medium is an American online publishing platform developed by Evan Williams and launched in August 2012.
              It is owned by A Medium Corporation.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 truncate">Publishing</span>
              <span className="text-green-600 font-medium whitespace-nowrap ml-2">1 job</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-8">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="outline" size="sm">
            &lt;
          </Button>
          <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
            3
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
            4
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent">
            5
          </Button>
          <span className="text-sm text-gray-500 hidden md:inline">...</span>
          <Button variant="outline" size="sm" className="hidden md:inline-flex bg-transparent">
            10
          </Button>
          <Button variant="outline" size="sm">
            &gt;
          </Button>
        </div>
      </div>
    </div>
  )
}
