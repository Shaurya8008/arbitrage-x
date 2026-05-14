cmake_minimum_required(VERSION 3.16)
project(NetworkRoutingAnalyzer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/main.cpp
    # Add other source files here as they are created
)

# Executable
add_executable(NetworkRoutingAnalyzer ${SOURCES})
