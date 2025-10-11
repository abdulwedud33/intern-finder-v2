"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Building, Globe } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useCompanies, type Company } from "@/hooks/useCompanies"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { getImageUrl, getCompanyLogoUrl } from "@/utils/imageUtils"
import { useState } from "react"
import Link from "next/link"

// Removed industry and company size filters as requested

export default function CompanyPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")

  // State to track if search has been performed
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch companies - show all by default, only filter when searched
  const { 
    companies, 
    loading, 
    error, 
    total, 
    page,
    updateFilters 
  } = useCompanies({ 
    limit: 12,
    search: hasSearched ? (searchQuery || undefined) : undefined,
    location: hasSearched ? (locationQuery || undefined) : undefined
  })

  // Handle search
  const handleSearch = () => {
    setHasSearched(true)
    updateFilters({
      search: searchQuery || undefined,
      location: locationQuery || undefined,
      page: 1
    })
  }

  // Handle clear search - show all companies again
  const handleClearSearch = () => {
    setSearchQuery("")
    setLocationQuery("")
    setHasSearched(false)
    updateFilters({
      search: undefined,
      location: undefined,
      page: 1
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-600 font-bold text-3xl mt-1">Browse Companies</h1>
          <p className="text-gray-500 mt-1">
            {hasSearched ? `${total} companies found` : `${total} companies available`}
          </p>
        </div>
      </div>
      <hr />

      {/* Search and location  */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Company Name or Keyword" 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Location" 
            className="pl-10"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-teal-500 hover:bg-teal-600 w-full sm:w-auto"
            onClick={handleSearch}
          >
            Search
          </Button>
          {hasSearched && (
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      <hr />

      {/* Companies Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} title="Failed to load companies" />
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {companies.map((company: Company) => (
            <Card key={company._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage 
                      src={getCompanyLogoUrl(company.logo)} 
                      alt={`${company.name} Logo`} 
                    />
                    <AvatarFallback>
                      {company.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/intern/company/${company._id}`}>
                      Detail
                    </Link>
                  </Button>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  <Link 
                    href={`/dashboard/intern/company/${company._id}`}
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    {company.name}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {company.description || "No description available."}
                </p>
                <div className="space-y-2">
                  {company.headquarters && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{company.headquarters}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="h-4 w-4 mr-2" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 truncate"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
              disabled={page <= 1}
            >
              &lt;
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-teal-500 hover:bg-teal-600"
            >
              {page}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateFilters({ page: page + 1 })}
              disabled={companies.length < 12}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
