﻿using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IDoctorRepository
    {
        Task<Doctor?> GetDoctorByUserIdAsync(int userId);
        Task UpdateDoctorAsync(Doctor doctor);
    }
}
